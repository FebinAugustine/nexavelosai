import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Agent, AgentDocument } from './agents.schema';
import { User, UserDocument } from '../users/users.schema';
import { EventsGateway } from '../events/events.gateway';
import { CreateAgentDto } from './dto/create-agent.dto';
import { AgentQueueService } from '../agent-queue/agent-queue.service';
import { LeadsService } from '../leads/leads.service';
import { TeamsService } from '../teams/teams.service';

@Injectable()
export class AgentsService {
  private readonly logger = new Logger(AgentsService.name);

  constructor(
    @InjectModel(Agent.name) private agentModel: Model<AgentDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private eventsGateway: EventsGateway,
    private agentQueueService: AgentQueueService, // Inject AgentQueueService
    private leadsService: LeadsService, // Inject LeadsService
    private teamsService: TeamsService, // Inject TeamsService
  ) {}

  async create(
    createAgentDto: CreateAgentDto,
    userId: string,
  ): Promise<AgentDocument> {
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

    // Add agent ID to user's agents array
    user.agents.push(savedAgent._id);
    await user.save();

    // Add domain to user domains if not present
    if (createAgentDto.domain) {
      const normalizedDomain = createAgentDto.domain
        .trim()
        .replace(/^https?:\/\//, '') // Remove http:// or https://
        .replace(/^www\./, '') // Remove www.
        .replace(/\/$/, ''); // Remove trailing slash

      if (
        !user.domains
          .map((d) => d.toLowerCase())
          .includes(normalizedDomain.toLowerCase())
      ) {
        user.domains.push(normalizedDomain);
        await user.save();
      }
    }

    // Invalidate cache
    const cacheKey = `agents:${userId}`;
    const analyticsCacheKey = `analytics:${userId}`;
    await this.cacheManager.del(cacheKey);
    await this.cacheManager.del(analyticsCacheKey);
    // Note: Detailed analytics cache invalidation would require knowing all possible month parameters
    // For now, we'll rely on the 5-minute TTL

    return savedAgent;
  }

  async findAll(userId: string): Promise<AgentDocument[]> {
    const cacheKey = `agents:${userId}`;
    const cachedAgents = await this.cacheManager.get<AgentDocument[]>(cacheKey);
    if (cachedAgents) {
      return cachedAgents;
    }

    // Get user's own agents
    const userAgents = await this.agentModel.find({ userId: userId }).exec();

    // Get shared agents from teams
    const userTeams = await this.teamsService.getTeamsByUser(userId);
    const sharedAgents: any[] = [];

    for (const team of userTeams) {
      const teamSharedAgents = await this.teamsService.getSharedAgents(
        team._id.toString(),
        userId,
      );
      sharedAgents.push(...teamSharedAgents);
    }

    // Combine and remove duplicates (in case an agent is shared multiple times)
    const allAgents = [...userAgents];
    const seenIds = new Set(userAgents.map((agent) => agent._id.toString()));

    for (const sharedAgent of sharedAgents) {
      if (!seenIds.has(sharedAgent._id.toString())) {
        seenIds.add(sharedAgent._id.toString());
        allAgents.push(sharedAgent);
      }
    }

    console.log('found agents for userId:', userId, allAgents.length);
    await this.cacheManager.set(cacheKey, allAgents, 300000); // 5 minutes
    return allAgents;
  }

  async findOne(id: string, userId: string): Promise<AgentDocument> {
    // Check if it's the user's own agent
    let agent = await this.agentModel
      .findOne({ _id: id, userId: userId })
      .exec();

    if (!agent) {
      // Check if it's a shared agent the user has access to
      const userTeams = await this.teamsService.getTeamsByUser(userId);

      for (const team of userTeams) {
        const teamSharedAgents = await this.teamsService.getSharedAgents(
          team._id.toString(),
          userId,
        );
        agent = teamSharedAgents.find(
          (sharedAgent) => sharedAgent._id.toString() === id,
        );

        if (agent) {
          break;
        }
      }
    }

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
    // Get existing agent to check old domain
    const existingAgent = await this.agentModel
      .findOne({ _id: id, userId: userId })
      .exec();
    if (!existingAgent) {
      throw new NotFoundException('Agent not found');
    }

    const agent = await this.agentModel
      .findOneAndUpdate({ _id: id, userId: userId }, updateAgentDto, {
        new: true,
      })
      .exec();

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    // Update user's domains if domain changed
    if (
      updateAgentDto.domain &&
      updateAgentDto.domain !== existingAgent.domain
    ) {
      const user = await this.userModel.findById(userId);
      if (user) {
        // Remove old domain from user's domains
        user.domains = user.domains.filter(
          (domain) => domain !== existingAgent.domain,
        );
        // Add new domain to user's domains if not already present
        if (!user.domains.includes(updateAgentDto.domain)) {
          user.domains.push(updateAgentDto.domain);
        }
        await user.save();
      }
    }

    // Invalidate cache
    const cacheKey = `agents:${userId}`;
    const analyticsCacheKey = `analytics:${userId}`;
    await this.cacheManager.del(cacheKey);
    await this.cacheManager.del(analyticsCacheKey);
    // Note: Detailed analytics cache invalidation would require knowing all possible month parameters
    // For now, we'll rely on the 5-minute TTL
    // Note: Snippet cache invalidation would require knowing all possible type and version combinations
    // For now, we'll rely on the 5-minute TTL
    return agent;
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.agentModel
      .deleteOne({ _id: id, userId: userId })
      .exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Agent not found');
    }

    // Remove agent ID from user's agents array
    await this.userModel.findByIdAndUpdate(userId, {
      $pull: { agents: id },
    });

    // Invalidate cache
    const cacheKey = `agents:${userId}`;
    const analyticsCacheKey = `analytics:${userId}`;
    await this.cacheManager.del(cacheKey);
    await this.cacheManager.del(analyticsCacheKey);
    // Note: Detailed analytics cache invalidation would require knowing all possible month parameters
    // For now, we'll rely on the 5-minute TTL
    // Note: Snippet cache invalidation would require knowing all possible type and version combinations
    // For now, we'll rely on the 5-minute TTL
  }

  async removeAllByUserId(userId: string): Promise<void> {
    await this.agentModel.deleteMany({ userId: userId }).exec();

    // Clear all agents from user's agents array
    await this.userModel.findByIdAndUpdate(userId, {
      agents: [],
    });

    // Invalidate cache
    const cacheKey = `agents:${userId}`;
    const analyticsCacheKey = `analytics:${userId}`;
    await this.cacheManager.del(cacheKey);
    await this.cacheManager.del(analyticsCacheKey);
    // Note: Detailed analytics cache invalidation would require knowing all possible month parameters
    // For now, we'll rely on the 5-minute TTL
  }

  async updateLeadCapture(
    id: string,
    userId: string,
    updateData: any,
  ): Promise<AgentDocument> {
    const agent = await this.agentModel
      .findOneAndUpdate(
        { _id: id, userId: userId },
        { leadCapture: updateData },
        { new: true },
      )
      .exec();

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    // Invalidate cache
    const cacheKey = `agents:${userId}`;
    await this.cacheManager.del(cacheKey);

    return agent;
  }

  async generateSnippet(
    agent: AgentDocument,
    type: string = 'js',
    version: string = 'full',
  ): Promise<string> {
    const cacheKey = `snippet:${agent._id}:${type}:${version}`;
    const cachedSnippet = await this.cacheManager.get<string>(cacheKey);
    if (cachedSnippet) {
      return cachedSnippet;
    }
    if (version === 'short') {
      if (type === 'react') {
        const snippet = `
// NexaVelosAI Widget Short Code for React/Next.js
// To customize the widget, add CSS overrides in your global styles
// Example customizations:
// .nexavel-chat-widget { z-index: 999999 !important; }
// .nexavel-chat-button { bottom: 30px !important; right: 30px !important; }

'use client';

import { useEffect } from 'react';

export default function NexaVelosAIWidget({ agentId }: { agentId: string }) {
  useEffect(() => {
    // Set global agent ID and API URL
    (window as any).nexavelAgentId = agentId;
    (window as any).nexavelApiUrl = 'http://localhost:5000';

    // Load widget script
    const script = document.createElement('script');
    script.src = 'http://localhost:5000/widget.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup
      document.body.removeChild(script);
      delete (window as any).nexavelAgentId;
      delete (window as any).nexavelApiUrl;
    };
  }, [agentId]);

  return null;
}
        `.trim();
        await this.cacheManager.set(cacheKey, snippet, 300000); // 5 minutes
        return snippet;
      } else {
        // JS short snippet
        const snippet = `<!-- NexaVelosAI Widget Short Code -->
<!-- To customize the widget, add CSS overrides in your website's styles -->
<!-- Example customizations:
<style>
.nexavel-chat-widget { z-index: 999999 !important; }
.nexavel-chat-button { bottom: 30px !important; right: 30px !important; }
</style>
-->
<script>window.nexavelAgentId = '${agent._id}'; window.nexavelApiUrl = 'http://localhost:5000';</script><script src="http://localhost:5000/widget.js"></script>`;
        await this.cacheManager.set(cacheKey, snippet, 300000); // 5 minutes
        return snippet;
      }
    }

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
          min-width: 300px;
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
      @media (max-width: 480px) {
        .nexavel-chat-window {
          width: calc(100vw - 40px);
          height: calc(100vh - 120px);
          bottom: 80px;
          right: 20px;
          max-width: 380px;
        }
        .nexavel-chat-widget {
          bottom: 20px;
          right: 20px;
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
    \`;

    // Inject styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // Create widget HTML
    const widgetHTML = \`
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
      </div>
    \`;

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
      sendButton.innerHTML = \`
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px; animation: spin 1s linear infinite;">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" stroke-dasharray="31.416" stroke-dashoffset="31.416">
            <animate attributeName="stroke-dashoffset" dur="1s" repeatCount="indefinite" values="31.416;0"/>
          </circle>
        </svg>
        Sending...
      \`;

      // Show typing indicator
      const typingIndicator = showTypingIndicator();

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
        sendButton.innerHTML = \`
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22,2 15,22 11,13 2,9"></polygon>
          </svg>
          Send Message
        \`;
      }
    }

    // Show typing indicator
    function showTypingIndicator() {
      const typingDiv = document.createElement('div');
      typingDiv.className = 'nexavel-chat-typing';
      typingDiv.innerHTML = \`
        <div class="nexavel-chat-typing-dots">
          <div class="nexavel-chat-typing-dot"></div>
          <div class="nexavel-chat-typing-dot"></div>
          <div class="nexavel-chat-typing-dot"></div>
        </div>
        <span style="color: #6b7280; font-size: 14px; font-weight: 500;">AI is typing...</span>
      \`;
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
    await this.cacheManager.set(cacheKey, snippet, 300000); // 5 minutes
    return snippet;
  }

  async chat(
    agentId: string,
    userId: string,
    message: string,
    chatSessionId?: string,
  ): Promise<{ jobId: string | number } | string> {
    // Updated return type
    if (userId) {
      // For logged-in users (dashboard), queue the job and send response via WebSocket
      const job = await this.agentQueueService.addAgentRequest({
        agentId,
        userId,
        message,
        chatSessionId,
      });
      return { jobId: job.id };
    } else {
      // For anonymous users (widget), process the request synchronously and return the response directly
      try {
        const responseText = await this.processQueuedAgentRequest(
          agentId,
          userId,
          message,
          chatSessionId,
        );
        return responseText;
      } catch (error: any) {
        this.logger.error(
          `Synchronous chat error for agentId: ${agentId}, userId: ${userId}: ${error.message}`,
          error.stack,
        );
        // Return a user-friendly error message, similar to what processQueuedAgentRequest would return on failure
        return (
          error.message ||
          'Sorry, there was an error processing your request. Please try again.'
        );
      }
    }
  }

  async processQueuedAgentRequest(
    agentId: string,
    userId: string,
    message: string,
    chatSessionId?: string,
  ): Promise<string> {
    this.logger.debug(
      `[processQueuedAgentRequest] Started for agentId: ${agentId}, userId: ${userId}`,
    );
    const agent = await this.agentModel.findById(agentId).exec();
    if (!agent) {
      this.logger.warn(
        `[processQueuedAgentRequest] Agent not found for agentId: ${agentId}`,
      );
      throw new NotFoundException('Agent not found');
    }
    let user: UserDocument | null = null;
    if (userId) {
      // Only attempt to find user if userId is not empty
      user = await this.userModel.findById(userId);
      if (!user) {
        // If userId was provided but user not found
        this.logger.warn(
          `[processQueuedAgentRequest] User not found for userId: ${userId}. Proceeding with default 'free' plan.`,
        );
      }
    }

    const planLimits = {
      free: { limit: 10, ttl: 1800000 }, // 10 requests per 30 minutes
      regular: { limit: 500, ttl: 1800000 }, // 500 requests per 30 minutes
      special: { limit: 100, ttl: 1800000 }, // 100 requests per 30 minutes
      agency: { limit: 5000, ttl: 1800000 }, // 5000 requests per 30 minutes
    };
    const plan = user?.plan || 'free'; // Default to 'free' if no user
    const { limit, ttl: windowMs } = planLimits[plan] || planLimits.free;

    const cacheKey = `agent_requests:${agentId}`;
    const now = Date.now();

    let timestamps: number[] =
      (await this.cacheManager.get<number[]>(cacheKey)) || [];
    // Filter timestamps within the last window
    timestamps = timestamps.filter((ts) => now - ts < windowMs);

    if (timestamps.length >= limit) {
      const resetTime = Math.ceil(
        (windowMs - (now - Math.min(...timestamps))) / 60000,
      ); // minutes until reset
      this.logger.warn(
        `[processQueuedAgentRequest] Rate limit exceeded for agentId: ${agentId}, userId: ${userId}`,
      );
      return `Rate limit exceeded. This agent has ${limit} requests per ${windowMs / 60000} minutes. Please try again in ${resetTime} minutes.`;
    }

    const systemPrompt = `You are ${agent.name}, ${agent.description || 'an AI assistant'}. ${agent.domain ? `Your domain is ${agent.domain}.` : ''} Answer questions based on the information provided in your description. Format your responses using markdown for better readability: use **bold** for emphasis, - for lists, etc. If asked about something not related to your purpose or description, politely explain that you can only assist with topics related to ${agent.description || 'your designated services'}.`;

    let responseText: string;
    const startTime = Date.now();

    try {
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

        if (!response.ok) {
          throw new Error(
            `Gemini API error: ${response.status} ${response.statusText}`,
          );
        }

        const data = await response.json();

        if (
          !data.candidates ||
          !data.candidates[0] ||
          !data.candidates[0].content ||
          !data.candidates[0].content.parts[0].text
        ) {
          throw new Error('Invalid response format from Gemini API');
        }

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

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `OpenAI API error: ${response.status} ${response.statusText} - ${errorData.error?.message}`,
          );
        }

        const data = await response.json();

        if (
          !data.choices ||
          !data.choices[0] ||
          !data.choices[0].message ||
          !data.choices[0].message.content
        ) {
          throw new Error('Invalid response format from OpenAI API');
        }

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

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `OpenRouter API error: ${response.status} ${response.statusText} - ${errorData.error?.message}`,
          );
        }

        const data = await response.json();

        if (
          !data.choices ||
          !data.choices[0] ||
          !data.choices[0].message ||
          !data.choices[0].message.content
        ) {
          throw new Error('Invalid response format from OpenRouter API');
        }

        responseText = data.choices[0].message.content;
      } else {
        throw new Error('Unsupported provider');
      }

      // Append remaining requests info only when 5 or fewer requests remain
      const remaining = limit - (timestamps.length + 1);
      if (remaining <= 5) {
        responseText += `\n\n*You have ${remaining} requests remaining in the next ${windowMs / 60000} minutes.*`;
      }

      // Update timestamps
      timestamps.push(now);
      await this.cacheManager.set(cacheKey, timestamps, windowMs);

      // Update analytics
      const responseTime = Date.now() - startTime;
      await this.agentModel.findByIdAndUpdate(agentId, {
        $inc: { chatCount: 1, totalInteractions: 1 },
        // Could add average response time, but for simplicity, just counts
      });

      // Emit real-time analytics update
      const analytics = await this.getAnalytics(userId.toString());
      this.eventsGateway.emitAnalyticsUpdate(analytics);

      // Save messages to chat session
      if (chatSessionId) {
        await this.leadsService.addMessageToChatSession(chatSessionId, userId, {
          role: 'user',
          content: message,
        });
        await this.leadsService.addMessageToChatSession(chatSessionId, userId, {
          role: 'agent',
          content: responseText,
        });
      }

      this.logger.debug(
        `[processQueuedAgentRequest] Completed for agentId: ${agentId}, userId: ${userId}`,
      );
      return responseText;
    } catch (error) {
      this.logger.error(
        `[processQueuedAgentRequest] Chat error for agentId: ${agentId}, userId: ${userId}: ${error.message}`,
        error.stack,
      );
      return 'Sorry, there was an error processing your request. You might have reached your request limit. Please upgrade your plan or try again later.';
    }
  }

  async getAnalytics(userId: string): Promise<any> {
    const cacheKey = `analytics:${userId}`;
    const cachedAnalytics = await this.cacheManager.get<any>(cacheKey);
    if (cachedAnalytics) {
      return cachedAnalytics;
    }

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

    const analytics = {
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

    await this.cacheManager.set(cacheKey, analytics, 300000); // 5 minutes
    return analytics;
  }

  async getDetailedAnalytics(userId: string, month?: string): Promise<any> {
    const cacheKey = month
      ? `analytics:${userId}:${month}`
      : `analytics:${userId}:all`;
    const cachedAnalytics = await this.cacheManager.get<any>(cacheKey);
    if (cachedAnalytics) {
      return cachedAnalytics;
    }

    const agents = await this.agentModel.find({ userId: userId }).exec();

    // Get current date and target month
    const now = new Date();
    const targetMonth = month
      ? new Date(month + '-01')
      : new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonth = new Date(
      targetMonth.getFullYear(),
      targetMonth.getMonth() + 1,
      1,
    );

    // Generate daily data for the month
    const dailyData: Array<{
      date: string;
      chats: number;
      interactions: number;
      agentsCreated: number;
    }> = [];
    const daysInMonth = new Date(
      targetMonth.getFullYear(),
      targetMonth.getMonth() + 1,
      0,
    ).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        targetMonth.getFullYear(),
        targetMonth.getMonth(),
        day,
      );
      const nextDay = new Date(date.getTime() + 24 * 60 * 60 * 1000);

      // Count agents created on this day
      const agentsCreated = agents.filter((agent) => {
        const createdAt = new Date((agent as any).createdAt);
        return createdAt >= date && createdAt < nextDay;
      }).length;

      // For now, we'll simulate chat data since we don't have individual chat timestamps
      // In a real implementation, you'd have a separate chat collection
      const dailyChats = Math.floor(Math.random() * 50) + 10; // Mock data
      const dailyInteractions = dailyChats * 2; // Mock data

      dailyData.push({
        date: date.toISOString().split('T')[0],
        chats: dailyChats,
        interactions: dailyInteractions,
        agentsCreated,
      });
    }

    // Monthly totals
    const monthlyTotal = dailyData.reduce(
      (acc, day) => ({
        chats: acc.chats + day.chats,
        interactions: acc.interactions + day.interactions,
        agentsCreated: acc.agentsCreated + day.agentsCreated,
      }),
      { chats: 0, interactions: 0, agentsCreated: 0 },
    );

    const detailedAnalytics = {
      month: targetMonth.toISOString().slice(0, 7), // YYYY-MM format
      dailyData,
      monthlyTotal,
      agents: agents.map((agent) => ({
        id: agent._id,
        name: agent.name,
        chatCount: agent.chatCount || 0,
        totalInteractions: agent.totalInteractions || 0,
        createdAt: (agent as any).createdAt,
      })),
    };

    await this.cacheManager.set(cacheKey, detailedAnalytics, 300000); // 5 minutes
    return detailedAnalytics;
  }

  async getUserPlan(userId: string): Promise<string> {
    const user = await this.userModel.findById(userId);
    return user?.plan || 'free';
  }
}
