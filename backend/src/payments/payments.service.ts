import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { User, UserDocument } from '../users/users.schema';
import { Billing, BillingDocument } from './billing.schema';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
  private razorpay: Razorpay;

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Billing.name) private billingModel: Model<BillingDocument>,
    private configService: ConfigService,
  ) {
    const keyId = this.configService.get<string>('RAZORPAY_KEY_ID');
    const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');
    if (keyId && keySecret) {
      this.razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
    }
  }

  private getPlanDetails(plan: string) {
    const plans = {
      regular: {
        amount: 59900,
        currency: 'USD',
        interval: 'monthly',
        name: 'Regular Plan',
      }, // $599
      special: {
        amount: 89900,
        currency: 'USD',
        interval: 'monthly',
        name: 'Special Plan',
      }, // $899
      agency: {
        amount: 0, // Contact for pricing
        currency: 'USD',
        interval: 'monthly',
        name: 'Agency Plan',
      },
    };
    return plans[plan] || null;
  }

  private getAgentLimit(plan: string) {
    const limits = {
      regular: 2,
      special: 5,
      agency: -1, // unlimited
    };
    return limits[plan] || 0;
  }

  async createSubscription(userId: string, plan: string) {
    if (!this.razorpay) throw new Error('Razorpay not configured');
    const planDetails = this.getPlanDetails(plan);
    if (!planDetails) throw new Error('Invalid plan');

    const subscription = await this.razorpay.subscriptions.create({
      plan_id: await this.getOrCreatePlan(plan, planDetails),
      customer_notify: 1,
      total_count: 12, // 1 year
    });

    // Save billing record as pending
    await this.billingModel.create({
      userId,
      amount: planDetails.amount,
      currency: planDetails.currency,
      status: 'pending',
      razorpaySubscriptionId: subscription.id,
      plan,
      description: `Subscription for ${planDetails.name}`,
    });

    return subscription;
  }

  private async getOrCreatePlan(plan: string, details: any) {
    // For simplicity, assume plans are created manually or hardcode IDs
    // In production, create plans via API if not exist
    const planIds = {
      regular: 'plan_regular_id',
      special: 'plan_special_id',
      agency: 'plan_agency_id',
    };
    return planIds[plan];
  }

  async handleWebhook(payload: any) {
    const event = payload.event;
    const data = payload.payload;

    if (event === 'subscription.activated') {
      const subscriptionId = data.subscription.entity.id;
      const billing = await this.billingModel.findOne({
        razorpaySubscriptionId: subscriptionId,
      });
      if (billing) {
        billing.status = 'paid';
        await billing.save();

        // Update user plan and agentLimit
        await this.userModel.findByIdAndUpdate(billing.userId, {
          plan: billing.plan,
          agentLimit: this.getAgentLimit(billing.plan),
        });
      }
    }
    // Handle other events if needed
  }

  async getBillingHistory(userId: string) {
    return this.billingModel.find({ userId }).sort({ createdAt: -1 });
  }

  verifyWebhook(body: Buffer, signature: string): boolean {
    const secret = this.configService.get<string>('RAZORPAY_WEBHOOK_SECRET');
    if (!secret) return false;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');
    return signature === expectedSignature;
  }
}
