import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BillingDocument = Billing & Document;

@Schema({ timestamps: true })
export class Billing {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ default: 'INR' })
  currency: string;

  @Prop({ required: true })
  status: string; // e.g., 'paid', 'failed', 'pending'

  @Prop()
  razorpayPaymentId?: string;

  @Prop()
  razorpaySubscriptionId?: string;

  @Prop()
  plan: string; // 'regular', 'special', 'agency'

  @Prop()
  description?: string;
}

export const BillingSchema = SchemaFactory.createForClass(Billing);
