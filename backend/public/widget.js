(function () {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }

  function initWidget() {
    // Get agent ID from URL parameter or global variable
    const urlParams = new URLSearchParams(window.location.search);
    let agentId = urlParams.get('agent') || window.nexavelAgentId;

    if (!agentId) {
      console.error('Agent ID not found in URL or global variable');
      return;
    }

    // Set API URL if not set
    if (!window.nexavelApiUrl) {
      // Find the script tag and get its origin
      const scripts = document.querySelectorAll('script');
      for (let script of scripts) {
        if (script.src && script.src.includes('widget.js')) {
          const url = new URL(script.src);
          window.nexavelApiUrl = url.origin;
          break;
        }
      }
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
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3), 0 4px 20px rgba(0, 0, 0, 0.1);
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        overflow: hidden;
      }
      .nexavel-chat-button::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
        border-radius: 50%;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      .nexavel-chat-button:hover::before {
        opacity: 1;
      }
      .nexavel-chat-button:hover {
        transform: translateY(-3px) scale(1.08);
        box-shadow: 0 15px 50px rgba(102, 126, 234, 0.4), 0 8px 30px rgba(0, 0, 0, 0.15);
      }
      .nexavel-chat-button:active {
        transform: translateY(-1px) scale(1.02);
      }
      .nexavel-chat-button-icon {
        position: relative;
        z-index: 1;
        transition: transform 0.3s ease;
      }
      .nexavel-chat-button:hover .nexavel-chat-button-icon {
        transform: rotate(15deg);
      }
      .nexavel-chat-window {
        display: none;
        position: absolute;
        bottom: 80px;
        right: 0;
        width: 380px;
        height: 600px;
        background: linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%);
        border-radius: 24px;
        box-shadow: 0 25px 80px rgba(0, 0, 0, 0.15), 0 10px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.3);
        flex-direction: column;
        overflow: hidden;
        animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        transform-origin: bottom right;
      }
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(30px) scale(0.9) rotate(-2deg);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1) rotate(0deg);
        }
      }
      .nexavel-chat-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 24px;
        font-weight: 700;
        font-size: 18px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: relative;
        overflow: hidden;
      }
      .nexavel-chat-header::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
        pointer-events: none;
      }
      .nexavel-chat-header-title {
        display: flex;
        align-items: center;
        gap: 14px;
        position: relative;
        z-index: 1;
      }
      .nexavel-chat-header-icon {
        width: 40px;
        height: 40px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.3);
      }
      .nexavel-chat-header-text {
        position: relative;
        z-index: 1;
      }
      .nexavel-chat-header-subtitle {
        font-size: 12px;
        opacity: 0.9;
        font-weight: 400;
      }
      .nexavel-chat-close {
        position: relative;
        z-index: 1;
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        backdrop-filter: blur(10px);
      }
      .nexavel-chat-close:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: scale(1.1);
      }
      .nexavel-chat-messages {
        flex: 1;
        padding: 24px;
        overflow-y: auto;
        background: linear-gradient(180deg, rgba(248,250,252,0.8) 0%, rgba(255,255,255,0.8) 100%);
        scroll-behavior: smooth;
        position: relative;
      }
      .nexavel-chat-messages::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.1) 50%, transparent 100%);
      }
      .nexavel-chat-messages::-webkit-scrollbar {
        width: 4px;
      }
      .nexavel-chat-messages::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.05);
        border-radius: 2px;
      }
      .nexavel-chat-messages::-webkit-scrollbar-thumb {
        background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
        border-radius: 2px;
        opacity: 0.7;
      }
      .nexavel-chat-messages::-webkit-scrollbar-thumb:hover {
        opacity: 1;
      }
      .nexavel-chat-message {
        margin-bottom: 20px;
        padding: 16px 20px;
        border-radius: 20px;
        max-width: 85%;
        font-size: 14px;
        line-height: 1.5;
        animation: messageSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        word-wrap: break-word;
      }
      @keyframes messageSlideIn {
        from {
          opacity: 0;
          transform: translateY(15px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      .nexavel-chat-message.user {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        margin-left: auto;
        border-bottom-right-radius: 6px;
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3), 0 2px 10px rgba(0, 0, 0, 0.1);
        position: relative;
      }
      .nexavel-chat-message.user::before {
        content: '';
        position: absolute;
        bottom: -2px;
        right: 20px;
        width: 0;
        height: 0;
        border-left: 8px solid transparent;
        border-right: 8px solid #764ba2;
        border-top: 8px solid transparent;
        border-bottom: 0;
      }
      .nexavel-chat-message.bot {
        background: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%);
        color: #374151;
        border: 1px solid rgba(0, 0, 0, 0.08);
        border-bottom-left-radius: 6px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.05);
        backdrop-filter: blur(10px);
        position: relative;
      }
      .nexavel-chat-message.bot::before {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 20px;
        width: 0;
        height: 0;
        border-left: 8px solid #f8fafc;
        border-right: 8px solid transparent;
        border-top: 8px solid transparent;
        border-bottom: 0;
      }
      .nexavel-chat-input-area {
        border-top: 1px solid rgba(0, 0, 0, 0.08);
        padding: 24px;
        background: linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%);
        border-radius: 0 0 24px 24px;
        backdrop-filter: blur(10px);
      }
      .nexavel-chat-input-container {
        position: relative;
        margin-bottom: 16px;
      }
      .nexavel-chat-input {
        min-width: 300px;
        padding: 16px 20px;
        border: 2px solid rgba(0, 0, 0, 0.1);
        border-radius: 16px;
        font-size: 14px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        background: rgba(255, 255, 255, 0.8);
        color: #374151;
        outline: none;
        backdrop-filter: blur(10px);
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      }
      .nexavel-chat-input:focus {
        border-color: #667eea;
        background: rgba(255, 255, 255, 0.95);
        box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1), 0 4px 20px rgba(102, 126, 234, 0.15);
        transform: translateY(-1px);
      }
      .nexavel-chat-input::placeholder {
        color: #9ca3af;
        font-style: italic;
      }
      .nexavel-chat-send {
        min-width: 300px;
        padding: 16px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 16px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3), 0 2px 10px rgba(0, 0, 0, 0.1);
        position: relative;
        overflow: hidden;
      }
      .nexavel-chat-send::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
        transition: left 0.5s ease;
      }
      .nexavel-chat-send:hover::before {
        left: 100%;
      }
      .nexavel-chat-send:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 30px rgba(102, 126, 234, 0.4), 0 4px 15px rgba(0, 0, 0, 0.15);
      }
      .nexavel-chat-send:active {
        transform: translateY(0);
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
      }
      .nexavel-chat-send:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
        box-shadow: 0 2px 10px rgba(102, 126, 234, 0.2);
      }
      .nexavel-chat-typing {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px 20px;
        background: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%);
        border: 1px solid rgba(0, 0, 0, 0.08);
        border-radius: 20px;
        border-bottom-left-radius: 6px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.05);
        backdrop-filter: blur(10px);
        max-width: 85%;
        margin-bottom: 20px;
        animation: messageSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .nexavel-chat-typing-dots {
        display: flex;
        gap: 6px;
      }
      .nexavel-chat-typing-dot {
        width: 8px;
        height: 8px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 50%;
        animation: typingDot 1.6s infinite ease-in-out;
        box-shadow: 0 2px 6px rgba(102, 126, 234, 0.3);
      }
      .nexavel-chat-typing-dot:nth-child(2) {
        animation-delay: 0.2s;
      }
      .nexavel-chat-typing-dot:nth-child(3) {
        animation-delay: 0.4s;
      }
      @keyframes typingDot {
        0%, 60%, 100% {
          transform: translateY(0) scale(1);
          opacity: 0.6;
        }
        30% {
          transform: translateY(-8px) scale(1.2);
          opacity: 1;
        }
      }
      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
      .nexavel-chat-welcome {
        text-align: center;
        padding: 32px 24px;
        color: #6b7280;
        font-size: 15px;
        line-height: 1.6;
        animation: fadeIn 0.6s ease-out;
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .nexavel-chat-welcome-icon {
        font-size: 32px;
        margin-bottom: 16px;
        display: block;
      }
       /* Lead Capture Modal */
       .nexavel-lead-capture-modal {
         display: none;
         position: absolute;
         bottom: 80px;
         right: 0;
         width: 380px;
         background: linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%);
         border-radius: 24px;
         box-shadow: 0 25px 80px rgba(0, 0, 0, 0.15), 0 10px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2);
         backdrop-filter: blur(20px);
         border: 1px solid rgba(255, 255, 255, 0.3);
         overflow: hidden;
         animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
         transform-origin: bottom right;
       }

       .nexavel-lead-capture-content {
         padding: 24px;
       }

       .nexavel-lead-capture-header {
         margin-bottom: 20px;
       }

       .nexavel-lead-capture-header h3 {
         font-size: 18px;
         font-weight: 700;
         color: #374151;
         margin-bottom: 8px;
       }

       .nexavel-lead-capture-header p {
         font-size: 14px;
         color: #6b7280;
         line-height: 1.5;
       }

       #nexavel-lead-capture-fields {
         margin-bottom: 20px;
       }

       .nexavel-lead-capture-field {
         margin-bottom: 16px;
       }

       .nexavel-lead-capture-field label {
         display: block;
         font-size: 14px;
         font-weight: 500;
         color: #374151;
         margin-bottom: 8px;
       }

       .nexavel-lead-capture-field input,
       .nexavel-lead-capture-field textarea {
         width: 100%;
         padding: 12px 16px;
         border: 2px solid rgba(0, 0, 0, 0.1);
         border-radius: 12px;
         font-size: 14px;
         transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
         background: rgba(255, 255, 255, 0.8);
         color: #374151;
         outline: none;
         backdrop-filter: blur(10px);
         box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
       }

       .nexavel-lead-capture-field input:focus,
       .nexavel-lead-capture-field textarea:focus {
         border-color: #667eea;
         background: rgba(255, 255, 255, 0.95);
         box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1), 0 4px 20px rgba(102, 126, 234, 0.15);
         transform: translateY(-1px);
       }

       .nexavel-lead-capture-field textarea {
         resize: vertical;
         min-height: 80px;
       }

       .nexavel-lead-capture-submit {
         width: 100%;
         padding: 16px;
         background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
         color: white;
         border: none;
         border-radius: 16px;
         font-size: 14px;
         font-weight: 600;
         cursor: pointer;
         transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
         box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3), 0 2px 10px rgba(0, 0, 0, 0.1);
         position: relative;
         overflow: hidden;
       }

       .nexavel-lead-capture-submit:hover:not(:disabled) {
         transform: translateY(-2px);
         box-shadow: 0 8px 30px rgba(102, 126, 234, 0.4), 0 4px 15px rgba(0, 0, 0, 0.15);
       }

       .nexavel-lead-capture-submit:active {
         transform: translateY(0);
         box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
       }

       .nexavel-lead-capture-submit:disabled {
         opacity: 0.6;
         cursor: not-allowed;
         transform: none;
         box-shadow: 0 2px 10px rgba(102, 126, 234, 0.2);
       }

       @media (max-width: 480px) {
         .nexavel-chat-window {
           width: calc(100vw - 40px);
           height: calc(100vh - 120px);
           bottom: 80px;
           right: 20px;
           max-width: 380px;
         }
         .nexavel-lead-capture-modal {
           width: calc(100vw - 40px);
           bottom: 80px;
           right: 20px;
           max-width: 380px;
         }
         .nexavel-chat-widget {
           bottom: 20px;
           right: 20px;
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
          <div class="nexavel-chat-button-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path>
            </svg>
          </div>
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
              <div class="nexavel-chat-header-text">
                <div style="font-weight: 600; font-size: 16px;">AI Assistant</div>
                <div class="nexavel-chat-header-subtitle">Online now</div>
              </div>
            </div>
            <button class="nexavel-chat-close" id="nexavel-chat-close">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="nexavel-chat-messages" id="nexavel-chat-messages">
            <div class="nexavel-chat-welcome">
              <span class="nexavel-chat-welcome-icon">👋</span>
              <div>Hi! I'm your AI assistant. How can I help you today?</div>
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
        <!-- Lead Capture Modal -->
        <div class="nexavel-lead-capture-modal" id="nexavel-lead-capture-modal">
          <div class="nexavel-lead-capture-content">
            <div class="nexavel-lead-capture-header">
              <h3>Get Started</h3>
              <p>Tell us a bit about yourself to continue</p>
            </div>
            <form id="nexavel-lead-capture-form">
              <div id="nexavel-lead-capture-fields"></div>
              <button type="submit" class="nexavel-lead-capture-submit">Continue</button>
            </form>
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
    const leadCaptureModal = document.getElementById(
      'nexavel-lead-capture-modal',
    );
    const leadCaptureForm = document.getElementById(
      'nexavel-lead-capture-form',
    );
    const leadCaptureFields = document.getElementById(
      'nexavel-lead-capture-fields',
    );

    // Lead capture state
    let leadCaptureConfig = null;
    let leadCaptureSubmitted = false;
    let messageCount = 0;
    let currentChatSessionId = null;

    // Load agent configuration
    const loadAgentConfig = async () => {
      try {
        const apiUrl = window.nexavelApiUrl || window.location.origin;
        const response = await fetch(`${apiUrl}/agents/${agentId}`);
        if (response.ok) {
          const agent = await response.json();
          if (agent.leadCapture && agent.leadCapture.enabled) {
            leadCaptureConfig = agent.leadCapture;
            // Render lead capture form
            renderLeadCaptureForm();
            // Set up trigger
            setupLeadCaptureTrigger();
          }
        }
      } catch (error) {
        console.error('Error loading agent config:', error);
      }
    };

    // Render lead capture form
    const renderLeadCaptureForm = () => {
      if (!leadCaptureConfig) return;

      leadCaptureFields.innerHTML = '';

      // Add default fields if none are configured
      const fields =
        leadCaptureConfig.formFields.length > 0
          ? leadCaptureConfig.formFields
          : [
              {
                name: 'email',
                label: 'Email',
                type: 'email',
                required: true,
                placeholder: 'Your email',
              },
              {
                name: 'name',
                label: 'Name',
                type: 'text',
                required: false,
                placeholder: 'Your name',
              },
              {
                name: 'phone',
                label: 'Phone',
                type: 'phone',
                required: false,
                placeholder: 'Your phone number',
              },
              {
                name: 'company',
                label: 'Company',
                type: 'text',
                required: false,
                placeholder: 'Your company',
              },
            ];

      fields.forEach((field) => {
        const fieldDiv = document.createElement('div');
        fieldDiv.className = 'nexavel-lead-capture-field';

        const label = document.createElement('label');
        label.textContent = field.label + (field.required ? ' *' : '');
        label.setAttribute('for', `nexavel-lead-field-${field.name}`);

        const input = document.createElement(
          field.type === 'textarea' ? 'textarea' : 'input',
        );
        input.id = `nexavel-lead-field-${field.name}`;
        input.name = field.name;
        input.type = field.type === 'textarea' ? 'text' : field.type;
        input.placeholder = field.placeholder || '';
        input.required = field.required;

        if (field.type === 'textarea') {
          input.rows = 3;
        }

        fieldDiv.appendChild(label);
        fieldDiv.appendChild(input);
        leadCaptureFields.appendChild(fieldDiv);
      });
    };

    // Set up lead capture trigger
    const setupLeadCaptureTrigger = () => {
      if (!leadCaptureConfig) return;

      if (
        leadCaptureConfig.trigger === 'time' &&
        leadCaptureConfig.triggerValue > 0
      ) {
        // Time delay trigger
        setTimeout(() => {
          if (!leadCaptureSubmitted) {
            showLeadCaptureModal();
          }
        }, leadCaptureConfig.triggerValue * 1000);
      }
    };

    // Show lead capture modal
    const showLeadCaptureModal = () => {
      leadCaptureModal.style.display = 'block';
      chatWindow.style.display = 'none';
    };

    // Hide lead capture modal
    const hideLeadCaptureModal = () => {
      leadCaptureModal.style.display = 'none';
      chatWindow.style.display = 'flex';
    };

    // Handle lead capture form submission
    const handleLeadCaptureSubmit = async (e) => {
      e.preventDefault();

      if (!leadCaptureConfig) return;

      // Collect form data
      const formData = new FormData(leadCaptureForm);
      const leadData = {
        agentId: agentId,
        ...Object.fromEntries(formData.entries()),
      };

      try {
        const apiUrl = window.nexavelApiUrl || window.location.origin;
        const response = await fetch(`${apiUrl}/leads`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(leadData),
        });

        if (response.ok) {
          const lead = await response.json();
          // Get chat session ID from the new lead
          if (lead.chatSessions && lead.chatSessions.length > 0) {
            currentChatSessionId = lead.chatSessions[0];
          }
          leadCaptureSubmitted = true;
          hideLeadCaptureModal();
          // Show welcome message
          addMessage(
            "👋 Hi! I'm your AI assistant. How can I help you today?",
            'bot',
          );
        } else {
          console.error('Error submitting lead:', response.statusText);
          // Show error message
          addMessage('Sorry, there was an error. Please try again.', 'bot');
        }
      } catch (error) {
        console.error('Error submitting lead:', error);
        // Show error message
        addMessage('Sorry, there was an error. Please try again.', 'bot');
      }
    };

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

      // Check if lead capture is required and not yet submitted
      if (leadCaptureConfig && !leadCaptureSubmitted) {
        // Check message count trigger
        if (
          leadCaptureConfig.trigger === 'messageCount' &&
          leadCaptureConfig.triggerValue > 0
        ) {
          messageCount++;
          if (messageCount >= leadCaptureConfig.triggerValue) {
            showLeadCaptureModal();
            return;
          }
        }
      }

      // Add user message
      addMessage(message, 'user');
      inputField.value = '';
      sendButton.disabled = true;
      sendButton.innerHTML = `
         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px; animation: spin 1s linear infinite;">
           <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" stroke-dasharray="31.416" stroke-dashoffset="31.416">
             <animate attributeName="stroke-dashoffset" dur="1s" repeatCount="indefinite" values="31.416;0"/>
           </circle>
         </svg>
         Sending...
       `;

      // Show typing indicator
      const typingIndicator = showTypingIndicator();

      try {
        const apiUrl = window.nexavelApiUrl || window.location.origin;
        const requestBody = {
          message,
          chatSessionId: currentChatSessionId,
        };
        const response = await fetch(`${apiUrl}/agents/${agentId}/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        // Remove typing indicator
        removeTypingIndicator(typingIndicator);

        if (response.ok) {
          const data = await response.json();
          addMessage(data.response, 'bot');
        } else {
          // Handle error responses
          let errorMessage = 'Sorry, there was an error. Please try again.';
          try {
            const errorData = await response.json();
            if (errorData?.message) {
              errorMessage = errorData.message;
            } else if (errorData?.error) {
              errorMessage = errorData.error;
            }
          } catch (e) {
            // If we can't parse the error response, use default
            if (response.status === 429) {
              errorMessage = 'Rate limit exceeded. Please try again later.';
            }
          }
          addMessage(errorMessage, 'bot');
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
        <span style="color: #6b7280; font-size: 14px; font-weight: 500;">AI is typing...</span>
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
    leadCaptureForm.addEventListener('submit', handleLeadCaptureSubmit);

    // Load agent configuration
    loadAgentConfig();
  }
})();
