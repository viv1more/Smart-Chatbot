
import logging
import requests
from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

# Ollama local configuration
OLLAMA_URL = "http://127.0.0.1:11434/api/chat"
MODEL = "qwen3.5:2b"

SYSTEM_PROMPT = """
You are a friendly general-purpose AI assistant.
Answer questions accurately and clearly.
Use simple language and examples when helpful.
Keep answers concise unless the user requests detail.
Do not include private reasoning or internal thought processes
in your answers.
"""

# Configure logging in the VS Code terminal
logging.basicConfig(level=logging.INFO)
app.logger.setLevel(logging.INFO)

# Reuse HTTP connections to Ollama
session = requests.Session()


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/health")
def health():
    """Check whether the local Ollama API is reachable."""
    try:
        response = session.get(
            "http://127.0.0.1:11434/api/tags",
            timeout=5
        )
        response.raise_for_status()

        models = response.json().get("models", [])
        installed = [
            model.get("name", "")
            for model in models
        ]

        return jsonify({
            "flask": "running",
            "ollama": "reachable",
            "model": MODEL,
            "model_installed": MODEL in installed
        })

    except requests.exceptions.RequestException:
        app.logger.exception("Ollama health check failed")
        return jsonify({
            "flask": "running",
            "ollama": "unavailable",
            "model": MODEL,
            "model_installed": False
        }), 503


@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json(silent=True) or {}

    message = data.get("message", "")
    history = data.get("history", [])

    # Validate user input
    if not isinstance(message, str) or not message.strip():
        return jsonify({
            "error": "Please enter a message."
        }), 400

    message = message.strip()

    if len(message) > 4000:
        return jsonify({
            "error": "Message is too long. Keep it under 4000 characters."
        }), 400

    if not isinstance(history, list):
        return jsonify({
            "error": "Invalid conversation history."
        }), 400

    # Build conversation for the local model
    messages = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT
        }
    ]

    # Include a small amount of recent history for 8 GB RAM
    total_history_chars = 0

    for item in reversed(history[-6:]):
        if not isinstance(item, dict):
            continue

        role = item.get("role")
        content = item.get("text", "")

        if role not in ("user", "assistant"):
            continue

        if not isinstance(content, str) or not content.strip():
            continue

        content = content[:1500]

        if total_history_chars + len(content) > 4000:
            continue

        messages.insert(1, {
            "role": role,
            "content": content
        })

        total_history_chars += len(content)

    messages.append({
        "role": "user",
        "content": message
    })

    # Request a response from Ollama
    try:
        response = session.post(
            OLLAMA_URL,
            json={
                "model": MODEL,
                "messages": messages,
                "stream": False,
                "think": False,
                "keep_alive": "5m",
                "options": {
                    "num_ctx": 2048,
                    "num_predict": 512,
                    "temperature": 0.7
                }
            },
            timeout=(5, 180)
        )

        # Raise an exception for HTTP errors
        response.raise_for_status()
        result = response.json()

        message_data = result.get("message") or {}
        answer = message_data.get("content") or ""
        answer = answer.strip()

        # Diagnostic information for troubleshooting
        app.logger.info(
            "Ollama response: done=%s, reason=%s, keys=%s",
            result.get("done"),
            result.get("done_reason"),
            list(message_data.keys())
        )

        # Handle empty responses
        if not answer:
            app.logger.error(
                "Empty Ollama response: %s",
                result
            )

            return jsonify({
                "error": (
                    "The local model returned no text. "
                    "Check the VS Code terminal for diagnostics."
                )
            }), 502

        return jsonify({
            "reply": answer
        })

    except requests.exceptions.ConnectionError:
        app.logger.exception("Cannot connect to Ollama")

        return jsonify({
            "error": (
                "Cannot connect to Ollama. "
                "Check that its local API is running on port 11434."
            )
        }), 503

    except requests.exceptions.Timeout:
        app.logger.exception("Ollama request timed out")

        return jsonify({
            "error": (
                "The model took too long to respond. "
                "Try a shorter question."
            )
        }), 504

    except requests.exceptions.HTTPError:
        status = response.status_code

        app.logger.exception(
            "Ollama returned HTTP status %s",
            status
        )

        return jsonify({
            "error": (
                f"Ollama returned HTTP {status}. "
                "Check the terminal for details."
            )
        }), 502

    except (ValueError, KeyError):
        app.logger.exception("Invalid response from Ollama")

        return jsonify({
            "error": "Could not read the response from Ollama."
        }), 502

    except requests.exceptions.RequestException:
        app.logger.exception("Unexpected Ollama request error")

        return jsonify({
            "error": "An unexpected local AI request error occurred."
        }), 502


if __name__ == "__main__":
    # Local development only; do not expose the debug server publicly.
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )
