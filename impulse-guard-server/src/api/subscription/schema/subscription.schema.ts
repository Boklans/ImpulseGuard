import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserSubscriptionDocument = HydratedDocument<UserSubscription>;

@Schema()
export class UserSubscription {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  platform: string;

  @Prop({ required: true, type: Date })
  at: Date;

  @Prop({ required: true })
  ip: string;

  @Prop({ required: false })
  language: string;
}

export const UserSubscriptionSchema =
  SchemaFactory.createForClass(UserSubscription);
