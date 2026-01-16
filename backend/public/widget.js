(function () {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }

  function initWidget() {
    // Get agent ID from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const agentId = urlParams.get('agent');

    if (!agentId) {
      console.error('Agent ID not found in URL');
      return;
    }

    // Create chat widget styles
    const styles = `
      .nexavel-chat-widget {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      }
      .nexavel-chat-button {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        color: white;
        font-size: 28px;
        cursor: pointer;
        box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .nexavel-chat-button:hover {
        transform: translateY(-2px) scale(1.05);
        box-shadow: 0 12px 40px rgba(102, 126, 234, 0.6);
      }
      .nexavel-chat-button:active {
        transform: translateY(0) scale(0.95);
      }
      .nexavel-chat-window {
        display: none;
        position: absolute;
        bottom: 84px;
        right: 0;
        width: 380px;
        height: 600px;
        background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 8px 32px rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        flex-direction: column;
        overflow: hidden;
        animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      .nexavel-chat-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px;
        font-weight: 600;
        font-size: 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .nexavel-chat-header-title {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .nexavel-chat-header-icon {
        width: 32px;
        height: 32px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .nexavel-chat-messages {
        flex: 1;
        padding: 20px;
        overflow-y: auto;
        background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
        scroll-behavior: smooth;
      }
      .nexavel-chat-messages::-webkit-scrollbar {
        width: 6px;
      }
      .nexavel-chat-messages::-webkit-scrollbar-track {
        background: transparent;
      }
      .nexavel-chat-messages::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.2);
        border-radius: 3px;
      }
      .nexavel-chat-message {
        margin-bottom: 16px;
        padding: 12px 16px;
        border-radius: 18px;
        max-width: 85%;
        font-size: 14px;
        line-height: 1.4;
        animation: messageSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      @keyframes messageSlideIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .nexavel-chat-message.user {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        margin-left: auto;
        border-bottom-right-radius: 4px;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
      }
      .nexavel-chat-message.bot {
        background: white;
        color: #374151;
        border: 1px solid rgba(0, 0, 0, 0.1);
        border-bottom-left-radius: 4px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }
      .nexavel-chat-input-area {
        border-top: 1px solid rgba(0, 0, 0, 0.1);
        padding: 20px;
        background: white;
        border-radius: 0 0 20px 20px;
      }
      .nexavel-chat-input-container {
        position: relative;
        margin-bottom: 12px;
      }
      .nexavel-chat-input {
        width: 100%;
        padding: 14px 16px;
        border: 2px solid rgba(0, 0, 0, 0.1);
        border-radius: 12px;
        font-size: 14px;
        transition: all 0.2s ease;
        background: #f8fafc;
        color: #374151;
        outline: none;
      }
      .nexavel-chat-input:focus {
        border-color: #667eea;
        background: white;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      }
      .nexavel-chat-input::placeholder {
        color: #9ca3af;
      }
      .nexavel-chat-send {
        width: 100%;
        padding: 14px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
      }
      .nexavel-chat-send:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
      }
      .nexavel-chat-send:active {
        transform: translateY(0);
      }
      .nexavel-chat-send:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }
      .nexavel-chat-typing {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 16px;
        background: white;
        border: 1px solid rgba(0, 0, 0, 0.1);
        border-radius: 18px;
        border-bottom-left-radius: 4px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        max-width: 85%;
        margin-bottom: 16px;
        animation: messageSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .nexavel-chat-typing-dots {
        display: flex;
        gap: 4px;
      }
      .nexavel-chat-typing-dot {
        width: 6px;
        height: 6px;
        background: #9ca3af;
        border-radius: 50%;
        animation: typingDot 1.4s infinite ease-in-out;
      }
      .nexavel-chat-typing-dot:nth-child(2) {
        animation-delay: 0.2s;
      }
      .nexavel-chat-typing-dot:nth-child(3) {
        animation-delay: 0.4s;
      }
      @keyframes typingDot {
        0%, 60%, 100% {
          transform: translateY(0);
          opacity: 0.4;
        }
        30% {
          transform: translateY(-10px);
          opacity: 1;
        }
      }
    `;

    // Inject styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // Create widget HTML
    const widgetHTML = `
      <div class="nexavel-chat-widget">
        <button class="nexavel-chat-button" id="nexavel-chat-toggle" aria-label="Open chat">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path>
          </svg>
        </button>
        <div class="nexavel-chat-window" id="nexavel-chat-window">
          <div class="nexavel-chat-header">
            <div class="nexavel-chat-header-title">
              <div class="nexavel-chat-header-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                  <path d="M12 17h.01"></path>
                  <circle cx="12" cy="12" r="10"></circle>
                </svg>
              </div>
              <div>
                <div style="font-weight: 600; font-size: 16px;">AI Assistant</div>
                <div style="font-size: 12px; opacity: 0.8;">Online now</div>
              </div>
            </div>
            <button id="nexavel-chat-close" style="color: white; background: none; border: none; cursor: pointer; padding: 4px; border-radius: 50%; transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='none'">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="nexavel-chat-messages" id="nexavel-chat-messages">
            <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 14px;">
              👋 Hi! I'm your AI assistant. How can I help you today?
            </div>
          </div>
          <div class="nexavel-chat-input-area">
            <div class="nexavel-chat-input-container">
              <input type="text" class="nexavel-chat-input" id="nexavel-chat-input" placeholder="Type your message here...">
            </div>
            <button class="nexavel-chat-send" id="nexavel-chat-send">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22,2 15,22 11,13 2,9"></polygon>
              </svg>
              Send Message
            </button>
          </div>
        </div>
      </div>
    `;

    // Inject HTML
    document.body.insertAdjacentHTML('beforeend', widgetHTML);

    // Get elements
    const toggleButton = document.getElementById('nexavel-chat-toggle');
    const closeButton = document.getElementById('nexavel-chat-close');
    const chatWindow = document.getElementById('nexavel-chat-window');
    const messagesContainer = document.getElementById('nexavel-chat-messages');
    const inputField = document.getElementById('nexavel-chat-input');
    const sendButton = document.getElementById('nexavel-chat-send');

    // Toggle chat window
    const toggleChat = () => {
      const isVisible = chatWindow.style.display === 'flex';
      chatWindow.style.display = isVisible ? 'none' : 'flex';
      if (!isVisible) {
        inputField.focus();
      }
    };

    toggleButton.addEventListener('click', toggleChat);
    closeButton.addEventListener('click', toggleChat);

    // Send message function
    async function sendMessage() {
      const message = inputField.value.trim();
      if (!message) return;

      // Add user message
      addMessage(message, 'user');
      inputField.value = '';
      sendButton.disabled = true;
      sendButton.textContent = 'Sending...';

      // Show typing indicator
      const typingIndicator = showTypingIndicator();

      try {
        const response = await fetch(
          `${window.location.origin}/agents/${agentId}/chat`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message }),
          },
        );

        // Remove typing indicator
        removeTypingIndicator(typingIndicator);

        if (response.ok) {
          const data = await response.json();
          addMessage(data.response, 'bot');
        } else {
          addMessage('Sorry, there was an error. Please try again.', 'bot');
        }
      } catch (error) {
        console.error('Error sending message:', error);
        removeTypingIndicator(typingIndicator);
        addMessage('Sorry, there was an error. Please try again.', 'bot');
      } finally {
        sendButton.disabled = false;
        sendButton.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22,2 15,22 11,13 2,9"></polygon>
          </svg>
          Send Message
        `;
      }
    }

    // Show typing indicator
    function showTypingIndicator() {
      const typingDiv = document.createElement('div');
      typingDiv.className = 'nexavel-chat-typing';
      typingDiv.innerHTML = `
        <div class="nexavel-chat-typing-dots">
          <div class="nexavel-chat-typing-dot"></div>
          <div class="nexavel-chat-typing-dot"></div>
          <div class="nexavel-chat-typing-dot"></div>
        </div>
        <span style="color: #6b7280; font-size: 14px;">AI is typing...</span>
      `;
      messagesContainer.appendChild(typingDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      return typingDiv;
    }

    // Remove typing indicator
    function removeTypingIndicator(typingDiv) {
      if (typingDiv && typingDiv.parentNode) {
        typingDiv.parentNode.removeChild(typingDiv);
      }
    }

    // Add message to chat
    function addMessage(text, type) {
      const messageDiv = document.createElement('div');
      messageDiv.className = `nexavel-chat-message ${type}`;
      messageDiv.textContent = text;
      messagesContainer.appendChild(messageDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    inputField.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
  }
})();
