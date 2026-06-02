import { Body, Controller, Headers, Logger, Post } from '@nestjs/common';
import { UserSubscribeService } from './user-subscribe.service';
import { PlatformType } from './model/platform-type';

@Controller('subscribe')
export class SubscribeController {
  constructor(private readonly userEventsService: UserSubscribeService) {}

  private readonly logger = new Logger(SubscribeController.name);

  @Post()
  async subscribe(
    @Headers('x-forwarded-for') forwardedFor: string,
    @Body('platform') platform: PlatformType,
    @Body('email') email: string,
    @Body('language') language: string,
  ) {
    const ip = forwardedFor || '127.0.0.1';

    return this.userEventsService.createSubscription({
      email,
      platform,
      ip,
      language,
    });
  }
}
