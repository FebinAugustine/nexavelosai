import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('subscribe')
  @UseGuards(JwtAuthGuard)
  async subscribe(@Body() body: { plan: string }, @Request() req) {
    const userId = (req.user as any).sub;
    const subscription = await this.paymentsService.createSubscription(
      userId,
      body.plan,
    );
    return { subscription };
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  async getBillingHistory(@Request() req) {
    const userId = (req.user as any).sub;
    return this.paymentsService.getBillingHistory(userId);
  }

  @Post('webhook')
  async handleWebhook(@Request() req: RawBodyRequest<any>) {
    const signature = req.headers['x-razorpay-signature'] as string;
    const rawBody = req.rawBody;

    if (!rawBody || !signature) {
      return { status: 'error', message: 'Invalid request' };
    }

    // Verify signature
    if (!this.paymentsService.verifyWebhook(rawBody, signature)) {
      return { status: 'error', message: 'Invalid signature' };
    }

    await this.paymentsService.handleWebhook(JSON.parse(rawBody.toString()));
    return { status: 'ok' };
  }
}
