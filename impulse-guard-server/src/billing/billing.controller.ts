import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BillingService } from './billing.service';
import { RevenueCatWebhookEvent } from './dto/revenuecat-webhook.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { UserDec } from 'src/auth/decorators/user.decorator';
import { UserPayload } from 'src/auth/payloads/user.payload';

@Controller('billing')
export class BillingController {
  private readonly logger = new Logger(BillingController.name);

  constructor(
    private readonly billingService: BillingService,
    private readonly configService: ConfigService,
  ) {}

  @Post('webhook/revenuecat')
  @Public()
  async handleRevenueCatWebhook(
    @Body() event: RevenueCatWebhookEvent,
    @Headers('authorization') authHeader: string,
  ) {
    // Verify webhook secret
    const webhookSecret = this.configService.get<string>(
      'REVENUECAT_WEBHOOK_SECRET',
    );

    if (webhookSecret) {
      // RevenueCat sends the secret directly or with Bearer prefix
      const receivedSecret = authHeader?.replace(/^Bearer\s+/i, '') || '';
      if (receivedSecret !== webhookSecret) {
        this.logger.warn('Invalid RevenueCat webhook authorization');
        throw new UnauthorizedException('Invalid webhook authorization');
      }
    }

    this.logger.log(`Received RevenueCat webhook: ${event.event?.type}`);

    await this.billingService.handleWebhook(event);

    return { success: true };
  }

  @Get('subscription')
  async getSubscriptionStatus(@UserDec() user: UserPayload) {
    return this.billingService.getSubscriptionStatus(user.id);
  }

  @Post('subscription/sync')
  async syncSubscription(
    @UserDec() user: UserPayload,
    @Body() data: { productId: string; expiresAt?: string; isActive: boolean },
  ) {
    return this.billingService.syncSubscription(user.id, {
      productId: data.productId,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      isActive: data.isActive,
    });
  }
}
