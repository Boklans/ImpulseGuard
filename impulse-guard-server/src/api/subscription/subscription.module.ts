import { Module } from '@nestjs/common';
import { UserSubscribeService } from './user-subscribe.service';
import { SubscribeController } from './subscribe.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  UserSubscription,
  UserSubscriptionSchema,
} from './schema/subscription.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserSubscription.name, schema: UserSubscriptionSchema },
    ]),
  ],
  controllers: [SubscribeController],
  providers: [UserSubscribeService],
})
export class SubscriptionModule {}
