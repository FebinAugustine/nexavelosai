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

@Injectable()
export class AgentsService {
  constructor(
    @InjectModel(Agent.name) private agentModel: Model<AgentDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private eventsGateway: EventsGateway,
  ) {}

  async create(createAgentDto: any, userId: string): Promise<AgentDocument> {
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

  async generateSnippet(agent: AgentDocument): Promise<string> {
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
