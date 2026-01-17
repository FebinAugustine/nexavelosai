import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Agent, AgentDocument } from './agents.schema';
import { User, UserDocument } from '../users/users.schema';
import { EventsGateway } from '../events/events.gateway';
import { CreateAgentDto } from './dto/create-agent.dto';

@Injectable()
export class AgentsService {
  constructor(
    @InjectModel(Agent.name) private agentModel: Model<AgentDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private eventsGateway: EventsGateway,
  ) {}

  async create(createAgentDto: CreateAgentDto, userId: string): Promise<AgentDocument> {
    console.log('Creating agent for userId:', userId);
    // Check plan limits
    const user = await this.userModel.findById(userId);
    console.log('User found:', user ? user.email : 'null');
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const currentAgents = await this.agentModel.countDocuments({
      userId: userId,
    });
    const limit = user.agentLimit === -1 ? Infinity : user.agentLimit || 5;

    if (currentAgents >= limit) {
      throw new BadRequestException(
        `Agent limit reached for ${user.plan} plan`,
      );
    }

    const agent = new this.agentModel({ ...createAgentDto, userId });
    const savedAgent = await agent.save();

    // Add domain to user domains if not present
    if (createAgentDto.domain) {
      const user = await this.userModel.findById(userId);
      if (user && !user.domains.includes(createAgentDto.domain)) {
        user.domains.push(createAgentDto.domain);
        await user.save();
      }
    }

    // Invalidate cache
    const cacheKey = `agents:${userId}`;
    await this.cacheManager.del(cacheKey);

    return savedAgent;
  }

  async findAll(userId: string): Promise<AgentDocument[]> {
    const cacheKey = `agents:${userId}`;
    const cachedAgents = await this.cacheManager.get<AgentDocument[]>(cacheKey);
    if (cachedAgents) {
      return cachedAgents;
    }
    const agents = await this.agentModel.find({ userId: userId }).exec();
    console.log('found agents for userId:', userId, agents.length);
    await this.cacheManager.set(cacheKey, agents, 300000); // 5 minutes
    return agents;
  }

  async findOne(id: string, userId: string): Promise<AgentDocument> {
    const query = userId ? { _id: id, userId: userId } : { _id: id };
    const agent = await this.agentModel.findOne(query).exec();
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }
    return agent;
  }

  async update(
    id: string,
    updateAgentDto: any,
    userId: string,
  ): Promise<AgentDocument> {
    const agent = await this.agentModel
      .findOneAndUpdate({ _id: id, userId: userId }, updateAgentDto, {
        new: true,
      })
      .exec();
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }
    // Invalidate cache
    const cacheKey = `agents:${userId}`;
    await this.cacheManager.del(cacheKey);
    return agent;
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.agentModel
      .deleteOne({ _id: id, userId: userId })
      .exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Agent not found');
    }
    // Invalidate cache
    const cacheKey = `agents:${userId}`;
    await this.cacheManager.del(cacheKey);
  }

  async removeAllByUserId(userId: string): Promise<void> {
    await this.agentModel.deleteMany({ userId: userId }).exec();
    // Invalidate cache
    const cacheKey = `agents:${userId}`;
    await this.cacheManager.del(cacheKey);
  }

  async generateSnippet(agent: AgentDocument, type: string = 'js'): Promise<string> {
    if (type === 'react') {
      // Generate React/NextJs component snippet
      const snippet = `
'use client';

import { useState, useEffect } from 'react';

export default function NexaVelosAIWidget({ agentId }: { agentId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; content: string }[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const toggleChat = () => setIsOpen(!isOpen);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = { role: 'user' as const, content: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(\`http://localhost:5000/agents/\${agentId}/chat\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.content }),
      });

      if (response.ok) {
        const data = await response.json();
        const botMessage = { role: 'bot' as const, content: data.response };
        setMessages(prev => [...prev, botMessage]);
      } else {
        setMessages(prev => [...prev, { role: 'bot', content: 'Sorry, there was an error. Please try again.' }]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { role: 'bot', content: 'Sorry, there was an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') sendMessage();
  };

  useEffect(() => {
    if (isOpen) {
      setMessages([{ role: 'bot', content: '👋 Hi! I\\'m your AI assistant. How can I help you today?' }]);
    }
  }, [isOpen]);

  return (
    <>
      <style jsx>{\`
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
        .nexavel-chat-window {
          display: \${isOpen ? 'flex' : 'none'};
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
        .nexavel-chat-messages {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
          scroll-behavior: smooth;
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
        .nexavel-chat-send:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
      \`}</style>
      <div className="nexavel-chat-widget">
        <button className="nexavel-chat-button" onClick={toggleChat} aria-label="Open chat">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path>
          </svg>
        </button>
        <div className="nexavel-chat-window">
          <div className="nexavel-chat-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                  <path d="M12 17h.01"></path>
                  <circle cx="12" cy="12" r="10"></circle>
                </svg>
              </div>
              <div>
                <div style={{ fontWeight: '600', fontSize: '16px' }}>AI Assistant</div>
                <div style={{ fontSize: '12px', opacity: '0.8' }}>Online now</div>
              </div>
            </div>
            <button onClick={toggleChat} style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '50%', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseOut={(e) => e.currentTarget.style.background = 'none'}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div className="nexavel-chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={\`nexavel-chat-message \${msg.role}\`}>
                {msg.content}
              </div>
            ))}
            {isLoading && (
              <div className="nexavel-chat-message bot">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <div style={{ width: '6px', height: '6px', background: '#9ca3af', borderRadius: '50%', animation: 'typingDot 1.4s infinite ease-in-out' }}></div>
                    <div style={{ width: '6px', height: '6px', background: '#9ca3af', borderRadius: '50%', animation: 'typingDot 1.4s infinite ease-in-out', animationDelay: '0.2s' }}></div>
                    <div style={{ width: '6px', height: '6px', background: '#9ca3af', borderRadius: '50%', animation: 'typingDot 1.4s infinite ease-in-out', animationDelay: '0.4s' }}></div>
                  </div>
                  <span style={{ color: '#6b7280', fontSize: '14px' }}>AI is typing...</span>
                </div>
              </div>
            )}
          </div>
          <div className="nexavel-chat-input-area">
            <input
              type="text"
              className="nexavel-chat-input"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
            />
            <button className="nexavel-chat-send" onClick={sendMessage} disabled={isLoading || !inputMessage.trim()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22,2 15,22 11,13 2,9"></polygon>
              </svg>
              Send Message
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
`.trim();
      return snippet;
    }

    // Generate inline JS snippet for embedding
    const snippet = `
<script>
(function () {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }

  function initWidget() {
    // Agent ID is embedded in the snippet
    const agentId = '${agent._id}';

    // Create chat widget styles
    const styles = \`
      .nexavel-chat-widget {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 1000;
        font-family: Arial, sans-serif;
      }
      .nexavel-chat-button {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: #007bff;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        transition: all 0.3s;
      }
      .nexavel-chat-button:hover {
        background: #0056b3;
        transform: scale(1.05);
      }
      .nexavel-chat-window {
        display: none;
        position: absolute;
        bottom: 80px;
        right: 0;
        width: 350px;
        height: 500px;
        background: white;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        flex-direction: column;
        overflow: hidden;
      }
      .nexavel-chat-header {
        background: #007bff;
        color: white;
        padding: 15px;
        font-weight: bold;
      }
      .nexavel-chat-messages {
        flex: 1;
        padding: 15px;
        overflow-y: auto;
        background: #f8f9fa;
      }
      .nexavel-chat-message {
        margin-bottom: 10px;
        padding: 8px 12px;
        border-radius: 8px;
        max-width: 80%;
      }
      .nexavel-chat-message.user {
        background: #007bff;
        color: white;
        margin-left: auto;
      }
      .nexavel-chat-message.bot {
        background: white;
        border: 1px solid #dee2e6;
      }
      .nexavel-chat-input-area {
        border-top: 1px solid #dee2e6;
        padding: 15px;
        background: white;
      }
      .nexavel-chat-input {
        width: 100%;
        padding: 10px;
        border: 1px solid #dee2e6;
        border-radius: 5px;
        margin-bottom: 10px;
      }
      .nexavel-chat-send {
        width: 100%;
        padding: 10px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
      }
      .nexavel-chat-send:hover {
        background: #0056b3;
      }
    \`;

    // Inject styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // Create widget HTML
    const widgetHTML = \`
      <div class="nexavel-chat-widget">
        <button class="nexavel-chat-button" id="nexavel-chat-toggle">💬</button>
        <div class="nexavel-chat-window" id="nexavel-chat-window">
          <div class="nexavel-chat-header">Chat with AI Agent</div>
          <div class="nexavel-chat-messages" id="nexavel-chat-messages"></div>
          <div class="nexavel-chat-input-area">
            <input type="text" class="nexavel-chat-input" id="nexavel-chat-input" placeholder="Type your message...">
            <button class="nexavel-chat-send" id="nexavel-chat-send">Send</button>
          </div>
        </div>
      </div>
    \`;

    // Inject HTML
    document.body.insertAdjacentHTML('beforeend', widgetHTML);

    // Get elements
    const toggleButton = document.getElementById('nexavel-chat-toggle');
    const chatWindow = document.getElementById('nexavel-chat-window');
    const messagesContainer = document.getElementById('nexavel-chat-messages');
    const inputField = document.getElementById('nexavel-chat-input');
    const sendButton = document.getElementById('nexavel-chat-send');

    // Toggle chat window
    toggleButton.addEventListener('click', () => {
      chatWindow.style.display =
        chatWindow.style.display === 'flex' ? 'none' : 'flex';
    });

    // Send message function
    async function sendMessage() {
      const message = inputField.value.trim();
      if (!message) return;

      // Add user message
      addMessage(message, 'user');
      inputField.value = '';

      try {
        const response = await fetch(
          \`https://conflictory-ungoverning-grayson.ngrok-free.dev/agents/\${agentId}/chat\`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message }),
          },
        );

        if (response.ok) {
          const data = await response.json();
          addMessage(data.response, 'bot');
        } else {
          addMessage('Sorry, there was an error. Please try again.', 'bot');
        }
      } catch (error) {
        console.error('Error sending message:', error);
        addMessage('Sorry, there was an error. Please try again.', 'bot');
      }
    }

    // Add message to chat
    function addMessage(text, type) {
      const messageDiv = document.createElement('div');
      messageDiv.className = \`nexavel-chat-message \${type}\`;
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
</script>
    `.trim();
    return snippet;
  }

  async chat(agent: AgentDocument, message: string): Promise<string> {
    const systemPrompt = `You are ${agent.name}, ${agent.description || 'an AI assistant'}. ${agent.domain ? `Your domain is ${agent.domain}.` : ''} Answer questions based on the information provided in your description. Format your responses using markdown for better readability: use **bold** for emphasis, - for lists, etc. If asked about something not related to your purpose or description, politely explain that you can only assist with topics related to ${agent.description || 'your designated services'}.`;

    let responseText: string;
    const startTime = Date.now();

    if (agent.provider === 'gemini') {
      const fullMessage = `${systemPrompt}\n\nUser: ${message}`;
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${agent.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: fullMessage }] }],
          }),
        },
      );
      const data = await response.json();
      responseText = data.candidates[0].content.parts[0].text;
    } else if (agent.provider === 'chatgpt') {
      const response = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${agent.apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: message },
            ],
          }),
        },
      );
      const data = await response.json();
      responseText = data.choices[0].message.content;
    } else if (agent.provider === 'openrouter') {
      const response = await fetch(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${agent.apiKey}`,
          },
          body: JSON.stringify({
            model: 'openai/gpt-3.5-turbo',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: message },
            ],
          }),
        },
      );
      const data = await response.json();
      responseText = data.choices[0].message.content;
    } else {
      throw new Error('Unsupported provider');
    }

    // Update analytics
    const responseTime = Date.now() - startTime;
    await this.agentModel.findByIdAndUpdate(agent._id, {
      $inc: { chatCount: 1, totalInteractions: 1 },
      // Could add average response time, but for simplicity, just counts
    });

    // Emit real-time analytics update
    const analytics = await this.getAnalytics(agent.userId.toString());
    this.eventsGateway.emitAnalyticsUpdate(analytics);

    return responseText;
  }

  async getAnalytics(userId: string): Promise<any> {
    const agents = await this.agentModel.find({ userId: userId }).exec();
    const totalAgents = agents.length;
    const totalChats = agents.reduce(
      (sum, agent) => sum + (agent.chatCount || 0),
      0,
    );
    const totalInteractions = agents.reduce(
      (sum, agent) => sum + (agent.totalInteractions || 0),
      0,
    );

    return {
      totalAgents,
      totalChats,
      totalInteractions,
      agents: agents.map((agent) => ({
        id: agent._id,
        name: agent.name,
        chatCount: agent.chatCount || 0,
        totalInteractions: agent.totalInteractions || 0,
      })),
    };
  }
}
