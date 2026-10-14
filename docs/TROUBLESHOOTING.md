# Troubleshooting

## Chatbot Does Not Start
Activate the virtual environment, install the required packages, and run `python app.py`. Review terminal errors.

## Ollama Connection Error
Confirm that Ollama is running and that `http://localhost:11434/api/tags` returns a response.

## Model Not Found
Run `ollama list` and check the configured model name in `app.py`.

## Markdown Appears as Literal Symbols
Confirm that `marked`, `DOMPurify`, and `highlight.js` load in the browser. Open Developer Tools and inspect the Console and Network tabs.

## Code Is Not Highlighted
Verify that fenced code blocks specify a language, such as ` ```python `, and that the Highlight.js script and stylesheet loaded successfully.

## Slow Responses
Local inference speed depends on the model, available memory, CPU/GPU hardware, and generation settings.

## Empty Responses
Inspect the Flask terminal and the JSON response from `/chat`. Do not assume a frontend formatting issue is the cause of a model or backend error.