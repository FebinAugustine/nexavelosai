import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/users.schema';
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
  ) {
    super(options, storageService, reflector);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?._id;

    if (!userId) {
      return true; // Allow unauthenticated requests (e.g., public chat)
    }

    // Get user from database
    const user = await this.userModel.findById(userId);
    if (!user) {
      return true; // Allow if user not found (shouldn't happen with JWT guard)
    }

    // Define rate limits per plan (requests per 30 minutes)
    const planLimits = {
      free: { limit: 10, ttl: 1800000 }, // 10 requests per 30 minutes
      regular: { limit: 500, ttl: 1800000 }, // 500 requests per 30 minutes
      special: { limit: 100, ttl: 1800000 }, // 100 requests per 30 minutes
      agency: { limit: 5000, ttl: 1800000 }, // 5000 requests per 30 minutes
    };

    const limitConfig = planLimits[user.plan] || planLimits.free;

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
      return result;
    } catch (error) {
      if (error instanceof ThrottlerException) {
        throw new ThrottlerException(
          'You have hit the maximum request per 30 minute, kindly try again after 30 miniutes.',
        );
      }
      throw error;
    }
  }

  // Override the getTracker method to track requests per user
  protected async getTracker(req: any): Promise<string> {
    return req.user?._id?.toString() || req.ip;
  }
}
