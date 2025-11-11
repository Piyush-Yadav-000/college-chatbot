// Message handling with advanced animations
function appendMessage(sender, text) {
    const chatBox = document.getElementById("chat-box");
    
    if (sender === "user") {
        const msgContainer = document.createElement("div");
        msgContainer.className = "user-msg-container";
        msgContainer.style.opacity = "0";
        
        const msgDiv = document.createElement("div");
        msgDiv.className = "user-msg";
        msgDiv.textContent = text;
        
        msgContainer.appendChild(msgDiv);
        chatBox.appendChild(msgContainer);
        
        requestAnimationFrame(() => {
            msgContainer.style.opacity = "1";
        });
        
    } else {
        const msgContainer = document.createElement("div");
        msgContainer.className = "bot-msg-container";
        msgContainer.style.opacity = "0";
        
        const avatar = document.createElement("div");
        avatar.className = "msg-avatar";
        avatar.innerHTML = '<i class="fas fa-robot"></i>';
        
        const msgDiv = document.createElement("div");
        msgDiv.className = "bot-msg";
        
        // Sanitize HTML to prevent XSS attacks
        const sanitizedText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        msgDiv.innerHTML = `<p>${sanitizedText}</p>`;
        
        msgContainer.appendChild(avatar);
        msgContainer.appendChild(msgDiv);
        chatBox.appendChild(msgContainer);
        
        requestAnimationFrame(() => {
            msgContainer.style.opacity = "1";
        });
    }
    
    smoothScrollToBottom();
}

// Smooth scroll animation
function smoothScrollToBottom() {
    const chatBox = document.getElementById("chat-box");
    chatBox.scrollTo({
        top: chatBox.scrollHeight,
        behavior: 'smooth'
    });
}

// Show typing indicator with animation
function showTyping() {
    const indicator = document.getElementById("typing-indicator");
    indicator.style.display = "flex";
    
    requestAnimationFrame(() => {
        indicator.style.opacity = "1";
        indicator.style.transition = "opacity 0.3s ease";
    });
    
    smoothScrollToBottom();
}

// Hide typing indicator
function hideTyping() {
    const indicator = document.getElementById("typing-indicator");
    indicator.style.opacity = "0";
    
    setTimeout(() => {
        indicator.style.display = "none";
    }, 300);
}

// Send message function with enhanced UX
function sendMessage(predefined = null) {
    const input = document.getElementById("user-input");
    const userText = predefined || input.value.trim();
    
    // Validate input
    if (userText === "" || userText.length === 0) return;
    
    // Check max length (matches backend)
    if (userText.length > 500) {
        appendMessage("bot", "Please keep your message under 500 characters.");
        return;
    }
    
    // Add vibration feedback on mobile
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
    
    appendMessage("user", userText);
    input.value = "";
    
    // Reset input height if using auto-resize
    input.style.height = 'auto';
    
    // CRITICAL FIX: Blur input to hide keyboard on mobile
    input.blur();
    
    // Add button press animation
    const sendBtn = document.getElementById("send-btn");
    sendBtn.style.transform = "scale(0.9)";
    setTimeout(() => {
        sendBtn.style.transform = "scale(1)";
    }, 150);
    
    // Disable send button temporarily to prevent spam
    sendBtn.disabled = true;
    input.disabled = true;
    
    // Show typing indicator
    showTyping();
    
    // Simulate realistic bot thinking time
    const thinkingTime = 600 + Math.random() * 400;
    
    setTimeout(() => {
        fetch("/api/get", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ msg: userText })
        })
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            hideTyping();
            
            setTimeout(() => {
                if (data.response) {
                    appendMessage("bot", data.response);
                } else if (data.error) {
                    appendMessage("bot", "Sorry, I encountered an error. Please try again or contact our admission helpdesk at 0129-4259000.");
                } else {
                    appendMessage("bot", "Sorry, I didn't receive a proper response. Please try again.");
                }
                
                // CRITICAL FIX: Re-enable controls WITHOUT auto-focus
                sendBtn.disabled = false;
                input.disabled = false;
                // REMOVED: input.focus(); ← This caused keyboard to open on Android
            }, 200);
        })
        .catch(error => {
            hideTyping();
            console.error("Error:", error);
            
            let errorMessage = "Sorry, I'm having trouble connecting. ";
            
            if (!navigator.onLine) {
                errorMessage += "Please check your internet connection and try again.";
            } else {
                errorMessage += "Please try again or contact our admission helpdesk at 0129-4259000.";
            }
            
            appendMessage("bot", errorMessage);
            
            // CRITICAL FIX: Re-enable controls WITHOUT auto-focus
            sendBtn.disabled = false;
            input.disabled = false;
            // REMOVED: input.focus();
        });
    }, thinkingTime);
}

// Handle Enter key press
function handleKeyPress(event) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

// Toggle chat window (minimize/maximize) with floating button
function toggleChat() {
    const container = document.querySelector(".chat-container");
    const toggleBtn = document.getElementById("chat-toggle-btn");
    const isMinimized = container.classList.contains("minimized");
    
    if (isMinimized) {
        // Show chat
        container.classList.remove("minimized");
        container.style.display = "flex";
        container.style.transform = "scale(1)";
        container.style.opacity = "1";
        
        // Hide floating button
        if (toggleBtn) {
            toggleBtn.style.display = "none";
        }
        
        // CRITICAL FIX: Don't auto-focus on mobile
        // setTimeout(() => {
        //     const input = document.getElementById("user-input");
        //     if (input) input.focus();
        // }, 300);
        
    } else {
        // Hide chat
        container.style.transform = "scale(0.8)";
        container.style.opacity = "0";
        
        setTimeout(() => {
            container.classList.add("minimized");
            container.style.display = "none";
            
            // Show floating button
            if (toggleBtn) {
                toggleBtn.style.display = "flex";
            }
        }, 300);
    }
}

// Initialize on DOM content loaded
document.addEventListener("DOMContentLoaded", () => {
    const userInput = document.getElementById("user-input");
    const sendBtn = document.getElementById("send-btn");
    
    // Add input focus animation
    if (userInput) {
        userInput.addEventListener("focus", () => {
            const inputArea = userInput.closest('.input-area');
            if (inputArea) {
                inputArea.style.boxShadow = "0 0 20px rgba(24, 72, 146, 0.4)";
            }
        });

        userInput.addEventListener("blur", () => {
            const inputArea = userInput.closest('.input-area');
            if (inputArea) {
                inputArea.style.boxShadow = "none";
            }
        });
        
        // CRITICAL FIX: REMOVED auto-focus on page load
        // setTimeout(() => {
        //     userInput.focus();
        // }, 1000);
    }
    
    // Add send button click animation
    if (sendBtn) {
        sendBtn.addEventListener("click", () => {
            sendBtn.classList.add("clicked");
            setTimeout(() => {
                sendBtn.classList.remove("clicked");
            }, 200);
            
            // CRITICAL FIX: Blur input after clicking send
            if (userInput) {
                userInput.blur();
            }
        });
    }
    
    // CRITICAL FIX: Blur input when quick buttons are clicked
    document.querySelectorAll(".quick-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            if (userInput) {
                userInput.blur();
            }
        });
    });
});

// Add welcome message animation on load
window.addEventListener("load", () => {
    const container = document.querySelector(".chat-container");
    const toggleBtn = document.getElementById("chat-toggle-btn");
    
    // Check if chat should start minimized
    const startMinimized = false;
    
    if (startMinimized) {
        container.classList.add("minimized");
        container.style.display = "none";
        if (toggleBtn) {
            toggleBtn.style.display = "flex";
        }
    } else {
        if (toggleBtn) {
            toggleBtn.style.display = "none";
        }
    }
    
    setTimeout(() => {
        smoothScrollToBottom();
        
        const quickBtns = document.querySelectorAll(".quick-btn");
        quickBtns.forEach((btn, index) => {
            setTimeout(() => {
                btn.style.animation = "fadeIn 0.5s ease forwards";
            }, index * 100);
        });
    }, 500);
});

// Add accessibility - keyboard navigation for quick buttons
document.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
        const focused = document.activeElement;
        if (focused && focused.classList.contains("quick-btn")) {
            focused.style.outline = "2px solid rgba(255, 255, 255, 0.8)";
            focused.style.outlineOffset = "2px";
        }
    }
});

// Remove outline when clicking with mouse
document.addEventListener("mousedown", () => {
    document.querySelectorAll(".quick-btn").forEach(btn => {
        btn.style.outline = "none";
    });
});

// Prevent double-click selection on buttons
document.querySelectorAll("button").forEach(button => {
    button.addEventListener("mousedown", (e) => {
        e.preventDefault();
    });
});

// Handle offline/online status
window.addEventListener("offline", () => {
    const chatBox = document.getElementById("chat-box");
    if (chatBox) {
        appendMessage("bot", "⚠️ You are currently offline. Please check your internet connection.");
    }
});

window.addEventListener("online", () => {
    const chatBox = document.getElementById("chat-box");
    if (chatBox) {
        appendMessage("bot", "✅ Connection restored! You can continue chatting.");
    }
});

// Clear chat function
function clearChat() {
    const chatBox = document.getElementById("chat-box");
    if (chatBox && confirm("Are you sure you want to clear the chat history?")) {
        chatBox.innerHTML = `
            <div class="date-divider">
                <span>Today</span>
            </div>
            <div class="bot-msg-container">
                <div class="msg-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="bot-msg">
                    <p>👋 Welcome to Manav Rachna International Institute of Research and Studies! I'm here to help you with admissions, courses, placements, and more. How can I assist you today?</p>
                </div>
            </div>
        `;
    }
}

// Export functions for potential future use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        sendMessage,
        clearChat,
        toggleChat
    };
}
