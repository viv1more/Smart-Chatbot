
"use strict";

// DOM elements
const appShell = document.getElementById("app-shell");
const chatForm = document.getElementById("chat-form");
const messageInput = document.getElementById("message-input");
const sendButton = document.getElementById("send-button");
const messagesContainer = document.getElementById("messages");
const welcomeScreen = document.getElementById("welcome-screen");
const newChatButton = document.getElementById("new-chat");
const sidebarToggle = document.getElementById("sidebar-toggle");
const brandButton = document.getElementById("brand-button");
const mobileMenu = document.getElementById("mobile-menu");
const mobileOverlay = document.getElementById("mobile-overlay");
const themeToggle = document.getElementById("theme-toggle");

let conversationHistory = [];
let isLoading = false;
let requestId = 0;

const MAX_HISTORY_MESSAGES = 6;

// Automatically resize the text area.
function resizeInput() {
    messageInput.style.height = "auto";
    messageInput.style.height =
        Math.min(messageInput.scrollHeight, 180) + "px";
}

messageInput.addEventListener("input", resizeInput);

// Scroll the conversation to the latest message.
function scrollToBottom() {
    const chatArea = document.getElementById("chat-area");
    chatArea.scrollTop = chatArea.scrollHeight;
}

// Convert Markdown to safe, formatted HTML.
function renderMarkdown(element, text) {
    if (
        typeof window.marked !== "undefined" &&
        typeof window.DOMPurify !== "undefined"
    ) {
        const html = window.marked.parse(text, {
            breaks: true,
            gfm: true
        });

        element.innerHTML = window.DOMPurify.sanitize(html, {
            USE_PROFILES: { html: true }
        });

        // Open links in a new tab safely.
        element.querySelectorAll("a").forEach((link) => {
            link.target = "_blank";
            link.rel = "noopener noreferrer";
        });

        // Apply syntax highlighting to fenced code blocks.
        if (typeof window.hljs !== "undefined") {
            element.querySelectorAll("pre code").forEach((block) => {
                window.hljs.highlightElement(block);
            });
        }
    } else {
        // Safe fallback if a CDN library could not load.
        element.textContent = text;

        console.error(
            "Markdown libraries are unavailable. Check your internet connection."
        );
    }
}

// Add a user or assistant message to the chat.
function addMessage(role, text) {
    const row = document.createElement("div");
    row.className = `message-row ${role}`;

    if (role === "assistant") {
        const avatar = document.createElement("div");
        avatar.className = "assistant-avatar";
        avatar.textContent = "✦";
        avatar.setAttribute("aria-label", "AI assistant");
        row.appendChild(avatar);
    }

    const content = document.createElement("div");
    content.className = "message-content";

    if (role === "assistant") {
        const roleLabel = document.createElement("div");
        roleLabel.className = "message-role";
        roleLabel.textContent = "Smart Chatbot";
        content.appendChild(roleLabel);
    }

    const textElement = document.createElement("div");
    textElement.className = "message-text";

    if (role === "assistant") {
        renderMarkdown(textElement, text);
    } else {
        // User input is always displayed as plain text.
        textElement.textContent = text;
        textElement.classList.add("user-message-text");
    }

    content.appendChild(textElement);

    if (role === "assistant") {
        const actions = document.createElement("div");
        actions.className = "message-actions";

        const copyButton = document.createElement("button");
        copyButton.type = "button";
        copyButton.className = "message-action";
        copyButton.textContent = "Copy";
        copyButton.title = "Copy response";

        copyButton.addEventListener("click", async () => {
            try {
                await navigator.clipboard.writeText(text);
                copyButton.textContent = "Copied!";

                setTimeout(() => {
                    copyButton.textContent = "Copy";
                }, 1500);
            } catch (error) {
                console.error("Copy failed:", error);
                copyButton.textContent = "Copy unavailable";
            }
        });

        actions.appendChild(copyButton);
        content.appendChild(actions);
    }

    row.appendChild(content);
    messagesContainer.appendChild(row);

    scrollToBottom();
    return row;
}

// Show an animated indicator while Ollama generates a reply.
function addTypingIndicator() {
    const row = document.createElement("div");
    row.className = "message-row assistant";
    row.id = "typing-indicator";

    const avatar = document.createElement("div");
    avatar.className = "assistant-avatar";
    avatar.textContent = "✦";

    const content = document.createElement("div");
    content.className = "message-content";

    const label = document.createElement("div");
    label.className = "message-role";
    label.textContent = "Smart Chatbot is thinking";

    const dots = document.createElement("div");
    dots.className = "typing-indicator";

    // Create elements instead of inserting HTML.
    for (let i = 0; i < 3; i++) {
        dots.appendChild(document.createElement("span"));
    }

    content.append(label, dots);
    row.append(avatar, content);

    messagesContainer.appendChild(row);
    scrollToBottom();

    return row;
}

// Send a prompt to the existing Flask /chat endpoint.
async function sendMessage(text) {
    text = text.trim();

    if (!text || isLoading) {
        return;
    }

    const currentRequestId = requestId;

    welcomeScreen.classList.add("hidden");
    addMessage("user", text);

    messageInput.value = "";
    resizeInput();

    isLoading = true;
    sendButton.disabled = true;
    sendButton.setAttribute("aria-label", "Waiting for response");

    const typingIndicator = addTypingIndicator();

    try {
        const response = await fetch("/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: text,
                history: conversationHistory.slice(
                    -MAX_HISTORY_MESSAGES
                )
            })
        });

        let data;

        try {
            data = await response.json();
        } catch {
            throw new Error(
                "The server returned an invalid response. Check Flask."
            );
        }

        // Ignore old responses after starting a new conversation.
        if (currentRequestId !== requestId) {
            return;
        }

        typingIndicator.remove();

        if (!response.ok) {
            throw new Error(
                data.error || `Server error (${response.status})`
            );
        }

        if (
            typeof data.reply !== "string" ||
            !data.reply.trim()
        ) {
            throw new Error("The model returned an empty response.");
        }

        addMessage("assistant", data.reply);

        // Keep successful exchanges for contextual follow-up questions.
        conversationHistory.push(
            { role: "user", content: text },
            { role: "assistant", content: data.reply }
        );

        conversationHistory = conversationHistory.slice(
            -MAX_HISTORY_MESSAGES
        );

    } catch (error) {
        if (currentRequestId !== requestId) {
            return;
        }

        typingIndicator.remove();

        addMessage(
            "assistant",
            `**Unable to get a response**\n\n${error.message}\n\nCheck that Flask and Ollama are running, then try again.`
        );

        console.error("Chat request failed:", error);

    } finally {
        if (currentRequestId === requestId) {
            isLoading = false;
            sendButton.disabled = false;
            sendButton.setAttribute("aria-label", "Send message");
            messageInput.focus();
        }
    }
}

// Submit the form.
chatForm.addEventListener("submit", (event) => {
    event.preventDefault();
    sendMessage(messageInput.value);
});

// Enter sends; Shift + Enter inserts a newline.
messageInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        chatForm.requestSubmit();
    }
});

// Handle suggestion cards on the welcome screen.
document.querySelectorAll("[data-prompt]").forEach((button) => {
    button.addEventListener("click", () => {
        if (isLoading) return;

        messageInput.value = button.dataset.prompt;
        resizeInput();
        sendMessage(messageInput.value);
    });
});

// Start a new conversation.
function resetChat() {
    requestId++;
    conversationHistory = [];
    isLoading = false;

    messagesContainer.replaceChildren();
    welcomeScreen.classList.remove("hidden");

    sendButton.disabled = false;
    sendButton.setAttribute("aria-label", "Send message");

    messageInput.value = "";
    resizeInput();
    messageInput.focus();

    closeMobileSidebar();
}

newChatButton.addEventListener("click", resetChat);

// Expand or collapse the desktop sidebar.
function toggleDesktopSidebar() {
    appShell.classList.toggle("sidebar-collapsed");
}

sidebarToggle.addEventListener("click", toggleDesktopSidebar);
brandButton.addEventListener("click", toggleDesktopSidebar);

// Mobile sidebar controls.
function openMobileSidebar() {
    appShell.classList.add("mobile-sidebar-open");
}

function closeMobileSidebar() {
    appShell.classList.remove("mobile-sidebar-open");
}

mobileMenu.addEventListener("click", openMobileSidebar);
mobileOverlay.addEventListener("click", closeMobileSidebar);

// Switch between dark and light themes.
themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light-theme");

    const isLight =
        document.body.classList.contains("light-theme");

    themeToggle.setAttribute(
        "aria-label",
        isLight ? "Switch to dark theme" : "Switch to light theme"
    );

    themeToggle.title =
        isLight ? "Switch to dark theme" : "Switch to light theme";
});

// Keyboard shortcuts.
document.addEventListener("keydown", (event) => {
    if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k"
    ) {
        event.preventDefault();
        resetChat();
    }

    if (event.key === "Escape") {
        closeMobileSidebar();
    }
});

// Initial setup.
resizeInput();
messageInput.focus();
