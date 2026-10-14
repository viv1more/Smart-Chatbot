# System Architecture

## Components

### Frontend
HTML defines the interface. CSS styles the layout. JavaScript manages chat interactions and renders assistant responses.

### Flask Backend
The Flask application serves the interface and exposes the `/chat` endpoint.

### Ollama Runtime
Ollama receives the model request and returns generated text to Flask.

### Language Model
The application is configured to use `qwen3.5:2b`. Actual model availability depends on the local Ollama installation.

## Request Flow

```text
User
  |
  v
Browser Interface
  |
  v
JavaScript fetch()
  |
  v
Flask /chat
  |
  v
Ollama API
  |
  v
Local Language Model
  |
  v
Flask JSON Response
  |
  v
Markdown Renderer
  |
  v
Formatted Assistant Message
```

## API Contract

### Endpoint
`POST /chat`

### Request
A JSON object containing the user's message and recent conversation history.

### Response
A JSON object containing `reply` on success or an error message on failure.

Consult `app.py` for the exact validation, model settings, and error-handling behavior.