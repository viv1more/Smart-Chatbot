# Installation Guide

## 1. Install Python
Install Python from the official Python website and verify the installation:

```powershell
python --version
```

## 2. Install Ollama
Install Ollama and verify that its local API is accessible:

```powershell
Invoke-RestMethod http://localhost:11434/api/tags
```

## 3. Download the Model

```powershell
ollama pull qwen3.5:2b
ollama list
```

If the `ollama` command is not recognized, verify the Ollama installation and PATH configuration.

## 4. Set Up the Project

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## 5. Run the Application

```powershell
python app.py
```

Open `http://127.0.0.1:5000` in a browser.

## 6. Troubleshooting

- If Flask cannot connect to Ollama, verify that the Ollama service is running.
- If the model is missing, run `ollama list`.
- If formatting is missing, check that the browser can load the Markdown and highlighting libraries.
- If a port is already occupied, check the Flask terminal for the actual startup address.

Follow the existing application's configuration when changing ports or model names.