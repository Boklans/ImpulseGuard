import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ _id: false })
class Streak {
  @Prop({ default: 0 })
  goal: number;

  @Prop({ default: 0 })
  daysInRow: number;

  @Prop({ default: 0 })
  totalDaysInRow: number;

  @Prop({ default: false })
  declined: boolean;

  @Prop()
  nextPromptDate?: Date;

  @Prop()
  startDate?: Date;

  @Prop()
  endDate?: Date;
}

export const StreakSchema = SchemaFactory.createForClass(Streak);

export enum SubscriptionStatus {
  NONE = 'none',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  GRACE_PERIOD = 'grace_period',
}

export enum SubscriptionPeriodType {
  TRIAL = 'trial',
  INTRO = 'intro',
  NORMAL = 'normal',
}

@Schema({ _id: false })
class Subscription {
  @Prop({
    type: String,
    enum: SubscriptionStatus,
    default: SubscriptionStatus.NONE,
  })
  status: SubscriptionStatus;

  @Prop()
  productId?: string;

  @Prop()
  revenuecatId?: string;

  @Prop()
  expiresAt?: Date;

  @Prop()
  originalPurchaseDate?: Date;

  @Prop({ default: false })
  willRenew: boolean;

  @Prop({
    type: String,
    enum: SubscriptionPeriodType,
    default: SubscriptionPeriodType.NORMAL,
  })
  periodType: SubscriptionPeriodType;

  @Prop()
  trialStartDate?: Date;

  @Prop()
  trialEndDate?: Date;

  @Prop({ default: false })
  trialReminderSent: boolean;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  clerkId: string;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  avatar?: string;

  @Prop({ default: 1 })
  level: number;

  @Prop({ default: 0 })
  experience: number;

  @Prop({ default: 0 })
  energy: number;

  @Prop({ default: 0 })
  glims: number;

  @Prop({ type: Object })
  preferences?: Record<string, any>;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;

  @Prop({ default: Date.now })
  lastLogin: Date;

  @Prop({ type: Array<number>, default: [] })
  claimedRewards: number[];

  @Prop({ type: Array<number>, default: [] })
  claimedPremiumRewards: number[];

  @Prop({ default: false })
  isOnboardingCompleted: boolean;

  @Prop({
    type: StreakSchema,
    default: () => ({ goal: 0, daysInRow: 0, declined: false }),
  })
  streakInfo: Streak;

  @Prop({
    type: SubscriptionSchema,
    default: () => ({ status: SubscriptionStatus.NONE, willRenew: false }),
  })
  subscription: Subscription;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Virtual getter for isPremium
UserSchema.virtual('isPremium').get(function () {
  const sub = this.subscription;
  if (!sub) return false;
  if (
    sub.status === SubscriptionStatus.ACTIVE ||
    sub.status === SubscriptionStatus.GRACE_PERIOD
  ) {
    if (sub.expiresAt) {
      return new Date() < new Date(sub.expiresAt);
    }
    return true;
  }
  return false;
});
