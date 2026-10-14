# ✦ Smart Chatbot

A modern, locally running AI chatbot built with **Python, Flask, Ollama, HTML, CSS, and JavaScript**. It provides a clean conversational interface with Markdown-rendered responses and code syntax highlighting.

## Overview

Smart Chatbot connects a web-based chat interface to a locally hosted language model through Ollama. Flask handles chat requests, while the frontend displays responses in a responsive, ChatGPT-inspired interface.

## Features

- **Local AI inference** using Ollama and the configured language model
- **Modern interface** with a dark theme and optional light theme
- **Markdown rendering** for headings, bold text, lists, tables, and links
- **Syntax-highlighted code blocks** for programming examples
- **Conversation context** using recent messages during the current session
- **Copy responses** to the clipboard
- **Responsive design** for desktop and mobile browsers
- **Suggestion prompts** to help users get started
- **New Chat** control to reset the current conversation

## Technology Stack

| Technology | Purpose |
|---|---|
| Python | Application backend |
| Flask | Web server and chat API |
| Ollama | Local language-model runtime |
| Qwen 3.5 2B | Configured AI model |
| HTML5 | Interface structure |
| CSS3 | Responsive styling |
| JavaScript | Chat interactions |
| Marked | Markdown parsing |
| DOMPurify | Sanitizing rendered HTML |
| Highlight.js | Code syntax highlighting |

## Project Structure

```text
Smart-Chatbot/
├── app.py
├── requirements.txt
├── templates/
│   └── index.html
├── static/
│   ├── style.css
│   └── script.js
├── docs/
└── README.md
```

## Getting Started

### Prerequisites

- Python 3.10 or later recommended
- Ollama installed and running
- The configured Ollama model downloaded
- A modern web browser

### Installation

1. Clone the repository:

   ```bash
   git clone YOUR_GITHUB_REPOSITORY_URL
   cd Smart-Chatbot
   ```

2. Create a virtual environment:

   ```bash
   python -m venv .venv
   ```

3. Activate it on Windows PowerShell:

   ```powershell
   .\.venv\Scripts\Activate.ps1
   ```

4. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

5. Download the model if it is not already installed:

   ```bash
   ollama pull qwen3.5:2b
   ```

6. Start the application:

   ```bash
   python app.py
   ```

7. Open the local address configured by Flask, normally:

   `http://127.0.0.1:5000`

## How It Works

1. The user submits a prompt through the browser.
2. JavaScript sends the prompt to Flask using an HTTP POST request.
3. Flask forwards the conversation to the local Ollama API.
4. The model generates a response.
5. JavaScript renders the response as formatted Markdown.
6. The interface displays the answer and keeps recent conversation context.

## Privacy

Prompts are sent to the local Ollama service by this application. However, external frontend libraries are loaded from CDNs in the current setup, and browser/network activity may contact those providers. Review the application and your Ollama configuration before using sensitive data.

## Current Limitations

- Conversation history is held in browser memory and is not permanently saved.
- Model response speed depends on hardware and model configuration.
- Markdown libraries require internet access when loaded from public CDNs.
- AI-generated content may be incorrect and should be verified.

## Future Improvements

- Persistent conversations and searchable chat history
- Streaming responses
- File upload and document question-answering
- Configurable model selection
- Improved error handling and model status indicators
- Offline hosting of frontend libraries

## License

This project is distributed under the MIT License. See `LICENSE` for details.

## Disclaimer

This is an educational and portfolio project. It is not affiliated with or endorsed by OpenAI, Ollama, or the Qwen model developers.