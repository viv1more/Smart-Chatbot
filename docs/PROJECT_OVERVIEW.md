# Project Overview

## Project Name
Smart Chatbot

## Objective
Build a web-based conversational AI assistant that runs a language model locally and provides a user-friendly interface for interacting with it.

## Problem Statement
Many AI chat interfaces rely on externally hosted inference services. This project explores a local alternative using Ollama, allowing users to run a supported language model on their own machine.

## Proposed Solution
The application uses Flask to connect the browser interface to Ollama. The frontend provides a chat experience with Markdown rendering, syntax highlighting, message copying, and responsive layout.

## Target Users
- Students learning AI and Python
- Developers experimenting with local language models
- Educators demonstrating conversational AI
- Developers building a foundation for document-based assistants

## Expected Outcome
A functional local chatbot that accepts user prompts, generates model responses, and presents them in a readable web interface.

## Scope
The current version focuses on text conversations. Persistent history, file uploads, retrieval-augmented generation, and streaming output are possible future extensions.