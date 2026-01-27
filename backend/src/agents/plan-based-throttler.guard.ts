import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/users.schema';
import { Agent, AgentDocument } from '../agents/agents.schema';
import { ThrottlerModuleOptions } from '@nestjs/throttler';
import { Reflector } from '@nestjs/core';
import { ThrottlerStorage } from '@nestjs/throttler';

@Injectable()
export class PlanBasedThrottlerGuard extends ThrottlerGuard {
  constructor(
    options: ThrottlerModuleOptions,
    storageService: ThrottlerStorage,
    reflector: Reflector,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Agent.name) private agentModel: Model<AgentDocument>,
  ) {
    super(options, storageService, reflector);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Skip rate limiting for static file requests (CSS, JS, images, etc.)
    if (this.isStaticFileRequest(request)) {
      return true;
    }

    const userId = request.user?._id;
    let user: UserDocument | null = null;

    if (userId) {
      // Authenticated request: Get user from request
      user = await this.userModel.findById(userId);
    } else {
      // Unauthenticated request: Get user from agent ID in URL
      const agentId = request.params.id;
      if (agentId) {
        const agent = await this.agentModel.findById(agentId);
        if (agent) {
          user = await this.userModel.findById(agent.userId);
        }
      }
    }

    // Define rate limits per plan
    const planLimits = {
      free: { limit: 10, ttl: 1800000 }, // 10 requests per 30 minutes
      regular: { limit: 500, ttl: 60000 }, // 500 requests per minute
      special: { limit: 100, ttl: 1800000 }, // 100 requests per minute
      agency: { limit: 5000, ttl: 1800000 }, // 5000 requests per minute
    };

    const limitConfig = user
      ? planLimits[user.plan] || planLimits.free
      : planLimits.free;

    if (user) {
      console.log(
        `Rate limiting for user ${user.email} (${user.plan} plan): ${limitConfig.limit} requests per ${limitConfig.ttl / 60000} minutes`,
      );
    } else if (request.params.id) {
      console.log(
        `Rate limiting for agent ${request.params.id} (free plan): ${limitConfig.limit} requests per ${limitConfig.ttl / 60000} minutes`,
      );
    }

    // Override default throttlers with plan-specific limits
    this.throttlers = [
      {
        name: 'plan-based',
        limit: limitConfig.limit,
        ttl: limitConfig.ttl,
      },
    ];

    try {
      // Call super.canActivate which will check the throttler
      const result = await super.canActivate(context);
      if (user) {
        console.log(`Request allowed for user ${user.email}`);
      } else if (request.params.id) {
        console.log(`Request allowed for agent ${request.params.id}`);
      }
      return result;
    } catch (error) {
      if (error instanceof ThrottlerException) {
        let errorMessage: string;
        if (user) {
          errorMessage = `Rate limit exceeded for your ${user.plan} plan. You have ${limitConfig.limit} requests per ${limitConfig.ttl / 60000} minutes. Please try again later.`;
          console.log(`Rate limit exceeded for user ${user.email}`);
        } else if (request.params.id) {
          errorMessage = `Rate limit exceeded. This agent has ${limitConfig.limit} requests per ${limitConfig.ttl / 60000} minutes. Please try again later.`;
          console.log(`Rate limit exceeded for agent ${request.params.id}`);
        } else {
          errorMessage = `Rate limit exceeded. You have ${limitConfig.limit} requests per ${limitConfig.ttl / 60000} minutes. Please try again later.`;
          console.log(`Rate limit exceeded for anonymous user`);
        }
        throw new ThrottlerException(errorMessage);
      }
      throw error;
    }
  }

  // Check if request is for a static file
  private isStaticFileRequest(req: any): boolean {
    const staticExtensions = [
      '.css',
      '.js',
      '.jpg',
      '.jpeg',
      '.png',
      '.gif',
      '.ico',
      '.svg',
      '.woff',
      '.woff2',
      '.ttf',
      '.eot',
    ];
    return staticExtensions.some((ext) => req.originalUrl?.includes(ext));
  }

  // Override the getTracker method to track requests per user or agent
  protected async getTracker(req: any): Promise<string> {
    // If authenticated, track by user ID
    if (req.user?._id) {
      return req.user._id.toString();
    }

    // If unauthenticated (widget chat), track by agent ID
    if (req.params.id) {
      return `agent-${req.params.id}`;
    }

    // Fallback to IP tracking
    return req.ip;
  }
}
