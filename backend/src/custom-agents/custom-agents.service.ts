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
import { CustomAgent, CustomAgentDocument } from './custom-agents.schema';
import { User, UserDocument } from '../users/users.schema';
import { EventsGateway } from '../events/events.gateway';
import { CreateCustomAgentDto } from './dto/create-custom-agent.dto';
import { AgentQueueService } from '../agent-queue/agent-queue.service';
import { LeadsService } from '../leads/leads.service';
import { TeamsService } from '../teams/teams.service';
import { WebhooksService } from '../webhooks/webhooks.service';
import { WebhookEventType } from '../webhooks/webhooks.schema';

@Injectable()
export class CustomAgentsService {
  private readonly logger = new Logger(CustomAgentsService.name);

  constructor(
    @InjectModel(CustomAgent.name)
    private customAgentModel: Model<CustomAgentDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private eventsGateway: EventsGateway,
    private agentQueueService: AgentQueueService,
    private leadsService: LeadsService,
    private teamsService: TeamsService,
    private webhooksService: WebhooksService,
  ) {}

  async create(
    createCustomAgentDto: CreateCustomAgentDto,
    userId: string,
  ): Promise<CustomAgentDocument> {
    this.logger.log('Creating custom agent for userId:', userId);

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const currentAgents = await this.customAgentModel.countDocuments({
      userId: userId,
    });
    const limit = user.agentLimit === -1 ? Infinity : user.agentLimit || 5;

    if (currentAgents >= limit) {
      throw new BadRequestException(
        `Agent limit reached for ${user.plan} plan`,
      );
    }

    const agent = new this.customAgentModel({
      ...createCustomAgentDto,
      userId,
    });
    const savedAgent = await agent.save();

    user.agents.push(savedAgent._id);
    await user.save();

    if (createCustomAgentDto.domain) {
      const normalizedDomain = createCustomAgentDto.domain
        .trim()
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .replace(/\/$/, '');

      if (
        !user.domains
          .map((d) => d.toLowerCase())
          .includes(normalizedDomain.toLowerCase())
      ) {
        user.domains.push(normalizedDomain);
        await user.save();
      }
    }

    const cacheKey = `custom-agents:${userId}`;
    const analyticsCacheKey = `analytics:${userId}`;
    await this.cacheManager.del(cacheKey);
    await this.cacheManager.del(analyticsCacheKey);

    await this.webhooksService.triggerWebhook(WebhookEventType.AGENT_CREATED, {
      event: WebhookEventType.AGENT_CREATED,
      timestamp: new Date().toISOString(),
      agentId: savedAgent._id.toString(),
      name: savedAgent.name,
      description: savedAgent.description,
    });

    return savedAgent;
  }

  async findAll(userId: string): Promise<any[]> {
    const cacheKey = `custom-agents:${userId}`;
    const cachedAgents =
      await this.cacheManager.get<CustomAgentDocument[]>(cacheKey);
    if (cachedAgents) {
      return cachedAgents;
    }

    const userAgents = await this.customAgentModel
      .find({ userId: userId })
      .exec();
    const userAgentsWithMetadata = userAgents.map((agent) => ({
      ...agent.toObject(),
      isShared: false,
      userRole: 'owner',
      isCustom: true,
    }));

    await this.cacheManager.set(cacheKey, userAgentsWithMetadata, 300);

    return userAgentsWithMetadata;
  }

  async findOne(id: string, userId: string): Promise<CustomAgentDocument> {
    const cacheKey = `custom-agent:${id}`;
    const cachedAgent =
      await this.cacheManager.get<CustomAgentDocument>(cacheKey);
    if (cachedAgent) {
      return cachedAgent;
    }

    const agent = await this.customAgentModel
      .findOne({
        _id: id,
        userId: userId,
      })
      .exec();

    if (!agent) {
      throw new NotFoundException('Custom agent not found');
    }

    await this.cacheManager.set(cacheKey, agent, 300);
    return agent;
  }

  async update(
    id: string,
    updateData: Partial<CreateCustomAgentDto>,
    userId: string,
  ): Promise<CustomAgentDocument> {
    const agent = await this.customAgentModel
      .findOneAndUpdate({ _id: id, userId: userId }, updateData, {
        new: true,
        runValidators: true,
      })
      .exec();

    if (!agent) {
      throw new NotFoundException('Custom agent not found');
    }

    const cacheKey = `custom-agents:${userId}`;
    const agentCacheKey = `custom-agent:${id}`;
    const analyticsCacheKey = `analytics:${userId}`;
    await this.cacheManager.del(cacheKey);
    await this.cacheManager.del(agentCacheKey);
    await this.cacheManager.del(analyticsCacheKey);

    return agent;
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.customAgentModel
      .deleteOne({
        _id: id,
        userId: userId,
      })
      .exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException('Custom agent not found');
    }

    const user = await this.userModel.findById(userId);
    if (user) {
      user.agents = user.agents.filter((agentId) => agentId.toString() !== id);
      await user.save();
    }

    const cacheKey = `custom-agents:${userId}`;
    const agentCacheKey = `custom-agent:${id}`;
    const analyticsCacheKey = `analytics:${userId}`;
    await this.cacheManager.del(cacheKey);
    await this.cacheManager.del(agentCacheKey);
    await this.cacheManager.del(analyticsCacheKey);
  }

  async chat(
    agentId: string,
    userId: string,
    message: string,
    chatSessionId?: string,
  ): Promise<{ jobId: string | number } | string> {
    if (userId) {
      // For logged-in users (dashboard), queue the job and send response via WebSocket
      const job = await this.agentQueueService.addCustomAgentRequest({
        agentId,
        userId,
        message,
        chatSessionId,
        action: 'chat',
      });
      return { jobId: job.id };
    } else {
      // For anonymous users (widget), process the request synchronously and return the response directly
      try {
        const responseText = await this.processQueuedCustomAgentRequest(
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
        return (
          error.message ||
          'Sorry, there was an error processing your request. Please try again.'
        );
      }
    }
  }

  async processQueuedCustomAgentRequest(
    agentId: string,
    userId: string,
    message: string,
    chatSessionId?: string,
  ): Promise<string> {
    this.logger.debug(
      `[processQueuedCustomAgentRequest] Started for agentId: ${agentId}, userId: ${userId}`,
    );
    const agent = await this.customAgentModel.findById(agentId).exec();
    if (!agent) {
      this.logger.warn(
        `[processQueuedCustomAgentRequest] Custom agent not found for agentId: ${agentId}`,
      );
      throw new NotFoundException('Custom agent not found');
    }

    let user: UserDocument | null = null;
    if (userId) {
      user = await this.userModel.findById(userId);
      if (!user) {
        this.logger.warn(
          `[processQueuedCustomAgentRequest] User not found for userId: ${userId}. Proceeding with default 'free' plan.`,
        );
      }
    }

    // Plan limits
    const planLimits = {
      free: { limit: 10, ttl: 1800000 }, // 10 requests per 30 minutes
      regular: { limit: 500, ttl: 1800000 }, // 500 requests per 30 minutes
      special: { limit: 100, ttl: 1800000 }, // 100 requests per 30 minutes
      agency: { limit: 5000, ttl: 1800000 }, // 5000 requests per 30 minutes
    };
    const plan = user?.plan || 'free';
    const { limit, ttl: windowMs } = planLimits[plan] || planLimits.free;

    const cacheKey = `custom-agent_requests:${agentId}`;
    const now = Date.now();

    let timestamps: number[] =
      (await this.cacheManager.get<number[]>(cacheKey)) || [];
    timestamps = timestamps.filter((timestamp) => now - timestamp < windowMs);

    if (timestamps.length >= limit) {
      this.logger.warn(
        `[processQueuedCustomAgentRequest] Rate limit exceeded for agentId: ${agentId}`,
      );
      throw new BadRequestException(
        'Rate limit exceeded. Please try again later.',
      );
    }

    timestamps.push(now);
    await this.cacheManager.set(cacheKey, timestamps, windowMs);

    // Increment chat count and total interactions
    await Promise.all([
      this.customAgentModel
        .findByIdAndUpdate(agentId, { $inc: { chatCount: 1 } })
        .exec(),
      this.customAgentModel
        .findByIdAndUpdate(agentId, { $inc: { totalInteractions: 1 } })
        .exec(),
    ]);

    // Implement custom agent chat logic with dynamic model support
    this.logger.debug(
      `[processQueuedCustomAgentRequest] Processing chat for custom agent: ${agent.name}, provider: ${agent.provider}, model: ${agent.model}`,
    );

    let responseText = '';
    try {
      if (agent.provider === 'gemini') {
        // Google Gemini API integration
        const fullMessage = `You are ${agent.name}, a custom AI agent. ${agent.description || 'You are here to help with any questions.'}\n\nUser: ${message}`;
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${agent.model}:generateContent?key=${agent.apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: fullMessage,
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1024,
              },
            }),
          },
        );

        if (!response.ok) {
          throw new Error(
            `Gemini API error: ${response.status} ${response.statusText}`,
          );
        }

        const data = await response.json();
        if (data.candidates && data.candidates.length > 0) {
          responseText = data.candidates[0].content.parts[0].text;
        } else {
          throw new Error('No response from Gemini API');
        }
      } else if (agent.provider === 'chatgpt') {
        // OpenAI ChatGPT API integration
        const response = await fetch(
          'https://api.openai.com/v1/chat/completions',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${agent.apiKey}`,
            },
            body: JSON.stringify({
              model: agent.model,
              messages: [
                {
                  role: 'system',
                  content: `You are ${agent.name}, a custom AI agent. ${agent.description || 'You are here to help with any questions.'}`,
                },
                {
                  role: 'user',
                  content: message,
                },
              ],
              temperature: 0.7,
              max_tokens: 1024,
            }),
          },
        );

        if (!response.ok) {
          throw new Error(
            `OpenAI API error: ${response.status} ${response.statusText}`,
          );
        }

        const data = await response.json();
        if (data.choices && data.choices.length > 0) {
          responseText = data.choices[0].message.content;
        } else {
          throw new Error('No response from OpenAI API');
        }
      } else if (agent.provider === 'openrouter') {
        // OpenRouter API integration (supports various models)
        // OpenRouter requires model names in format: provider/model (e.g., anthropic/claude-2, meta-llama/llama-2-70b-chat)
        let modelIdentifier = agent.model as unknown as string;

        // Validate model name format
        if (!modelIdentifier.includes('/')) {
          this.logger.error(
            `Invalid OpenRouter model format: ${modelIdentifier}`,
          );
          throw new Error(
            'Invalid model format. OpenRouter requires models in format: provider/model (e.g., anthropic/claude-2)',
          );
        }

        this.logger.debug(
          `[processQueuedCustomAgentRequest] Using OpenRouter model: ${modelIdentifier}`,
        );

        const response = await fetch(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${agent.apiKey}`,
              'HTTP-Referer': 'https://nexavelosai.com', // Replace with your actual domain
              'X-Title': 'Nexavel OS AI', // Replace with your application name
            },
            body: JSON.stringify({
              model: modelIdentifier,
              messages: [
                {
                  role: 'system',
                  content: `You are ${agent.name}, a custom AI agent. ${agent.description || 'You are here to help with any questions.'}`,
                },
                {
                  role: 'user',
                  content: message,
                },
              ],
              temperature: 0.7,
              max_tokens: 1024,
            }),
          },
        );

        if (!response.ok) {
          // Get detailed error information from OpenRouter
          let errorDetails = '';
          try {
            const errorData = await response.json();
            errorDetails =
              errorData?.error?.message || JSON.stringify(errorData);
            this.logger.error(`OpenRouter API error details: ${errorDetails}`);
          } catch (e) {
            errorDetails = response.statusText;
          }

          // Check if the error is about data policy
          if (errorDetails.includes('data policy')) {
            errorDetails +=
              '. Please check your OpenRouter API settings at https://openrouter.ai/settings/privacy';
          }

          // Check if the error is about invalid model (404 likely means model not found)
          if (response.status === 404) {
            errorDetails = `Model not found: ${modelIdentifier}. Please check if the model exists on OpenRouter.`;
          }

          throw new Error(
            `OpenRouter API error: ${response.status} ${response.statusText} - ${errorDetails}`,
          );
        }

        const data = await response.json();
        if (data.choices && data.choices.length > 0) {
          responseText = data.choices[0].message.content;
        } else {
          throw new Error('No response from OpenRouter API');
        }
      } else if (agent.provider === 'custom') {
        // Custom provider integration (placeholder for future expansion)
        throw new Error('Custom provider not supported yet');
      } else {
        throw new Error(`Unsupported provider: ${agent.provider}`);
      }
    } catch (error: any) {
      this.logger.error(
        `[processQueuedCustomAgentRequest] Error processing chat for custom agent: ${agent.name}, model: ${agent.model}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(`Failed to process chat: ${error.message}`);
    }

    return responseText;
  }

  async incrementChatCount(id: string): Promise<void> {
    const jobData = { agentId: id, action: 'incrementChatCount' };
    await this.agentQueueService.addCustomAgentRequest(jobData);
  }

  async incrementTotalInteractions(id: string): Promise<void> {
    const jobData = { agentId: id, action: 'incrementTotalInteractions' };
    await this.agentQueueService.addCustomAgentRequest(jobData);
  }
}
