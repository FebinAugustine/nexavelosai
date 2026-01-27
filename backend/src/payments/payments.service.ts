import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
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
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
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
        amount: 49900, // ₹499
        currency: 'INR',
        interval: 'monthly',
        name: 'Regular Plan',
      },
      special: {
        amount: 89900, // ₹899
        currency: 'INR',
        interval: 'monthly',
        name: 'Special Plan',
      },
      agency: {
        amount: 0, // Contact for pricing
        currency: 'INR',
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

  async createOrder(userId: string, plan: string) {
    if (!this.razorpay) throw new Error('Razorpay not configured');
    const planDetails = this.getPlanDetails(plan);
    if (!planDetails) throw new Error('Invalid plan');

    const options = {
      amount: planDetails.amount, // amount in paisa
      currency: planDetails.currency,
      receipt: `rcpt_${userId.slice(-4)}${Date.now()}`,
      notes: {
        plan: plan,
        userId: userId,
      },
    };

    const order = await this.razorpay.orders.create(options);

    // Save billing record as pending
    await this.billingModel.create({
      userId,
      amount: planDetails.amount,
      currency: planDetails.currency,
      status: 'pending',
      razorpayOrderId: order.id,
      plan,
      description: `Payment for ${planDetails.name}`,
    });

    return order;
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

  async verifyPayment(orderId: string, paymentId: string, signature: string) {
    const secret = this.configService.get<string>('RAZORPAY_KEY_SECRET');
    if (!secret) throw new Error('Razorpay secret not configured');

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    if (expectedSignature !== signature) {
      throw new Error('Payment verification failed');
    }

    // Find and update billing record
    const billing = await this.billingModel.findOne({
      razorpayOrderId: orderId,
    });
    if (!billing) throw new Error('Billing record not found');

    billing.status = 'paid';
    billing.razorpayPaymentId = paymentId;
    await billing.save();

    // Update user plan
    await this.userModel.findByIdAndUpdate(billing.userId, {
      plan: billing.plan,
      agentLimit: this.getAgentLimit(billing.plan),
    });

    // Invalidate cache
    const cacheKey = `user:${billing.userId}`;
    await this.cacheManager.del(cacheKey);

    return billing;
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
