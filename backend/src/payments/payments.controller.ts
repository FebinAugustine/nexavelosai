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

  @Post('create-order')
  @UseGuards(JwtAuthGuard)
  async createOrder(@Body() body: { plan: string }, @Request() req) {
    const userId = req.user._id.toString();
    const order = await this.paymentsService.createOrder(userId, body.plan);
    return { order };
  }

  @Post('verify-payment')
  @UseGuards(JwtAuthGuard)
  async verifyPayment(
    @Body() body: { orderId: string; paymentId: string; signature: string },
    @Request() req,
  ) {
    const userId = req.user._id.toString();
    const billing = await this.paymentsService.verifyPayment(
      body.orderId,
      body.paymentId,
      body.signature,
    );
    return { success: true, billing };
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  async getBillingHistory(@Request() req) {
    const userId = req.user._id.toString();
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
