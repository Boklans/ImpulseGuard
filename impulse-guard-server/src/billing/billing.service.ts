import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  User,
  UserDocument,
  SubscriptionStatus,
  SubscriptionPeriodType,
} from 'src/users/schema/user.schema';
import { RevenueCatWebhookEvent } from './dto/revenuecat-webhook.dto';
import { Cron } from '@nestjs/schedule';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async handleWebhook(event: RevenueCatWebhookEvent): Promise<void> {
    const { type, app_user_id, product_id, expiration_at_ms } = event.event;

    this.logger.log(
      `Processing RevenueCat webhook: ${type} for user ${app_user_id}`,
    );

    // app_user_id from RevenueCat is typically the clerkId we set
    const user = await this.userModel.findOne({ clerkId: app_user_id });

    if (!user) {
      // Try finding by MongoDB _id (if app_user_id is the _id)
      const userById = await this.userModel
        .findById(app_user_id)
        .catch(() => null);
      if (!userById) {
        this.logger.warn(`User not found for app_user_id: ${app_user_id}`);
        return;
      }
      return this.processEvent(userById, event);
    }

    return this.processEvent(user, event);
  }

  private async processEvent(
    user: UserDocument,
    event: RevenueCatWebhookEvent,
  ): Promise<void> {
    const {
      type,
      product_id,
      expiration_at_ms,
      purchased_at_ms,
      period_type,
      is_trial_conversion,
    } = event.event;

    // Map RevenueCat period_type to our enum
    const periodType = this.mapPeriodType(period_type);

    switch (type) {
      case 'INITIAL_PURCHASE':
      case 'RENEWAL':
      case 'UNCANCELLATION':
        await this.activateSubscription(user, {
          productId: product_id,
          expiresAt: expiration_at_ms ? new Date(expiration_at_ms) : undefined,
          originalPurchaseDate: purchased_at_ms
            ? new Date(purchased_at_ms)
            : undefined,
          willRenew: true,
          periodType,
          isTrialConversion: is_trial_conversion,
        });
        break;

      case 'CANCELLATION':
        await this.cancelSubscription(user);
        break;

      case 'EXPIRATION':
        await this.expireSubscription(user);
        break;

      case 'BILLING_ISSUE':
        await this.setGracePeriod(user);
        break;

      default:
        this.logger.log(`Unhandled event type: ${type}`);
    }
  }

  private mapPeriodType(
    periodType: 'TRIAL' | 'INTRO' | 'NORMAL',
  ): SubscriptionPeriodType {
    switch (periodType) {
      case 'TRIAL':
        return SubscriptionPeriodType.TRIAL;
      case 'INTRO':
        return SubscriptionPeriodType.INTRO;
      default:
        return SubscriptionPeriodType.NORMAL;
    }
  }

  private async activateSubscription(
    user: UserDocument,
    data: {
      productId: string;
      expiresAt?: Date;
      originalPurchaseDate?: Date;
      willRenew: boolean;
      periodType: SubscriptionPeriodType;
      isTrialConversion?: boolean;
    },
  ): Promise<void> {
    const isStartingTrial =
      data.periodType === SubscriptionPeriodType.TRIAL &&
      user.subscription?.periodType !== SubscriptionPeriodType.TRIAL;

    const isConvertingFromTrial =
      data.isTrialConversion ||
      (user.subscription?.periodType === SubscriptionPeriodType.TRIAL &&
        data.periodType === SubscriptionPeriodType.NORMAL);

    user.subscription = {
      status: SubscriptionStatus.ACTIVE,
      productId: data.productId,
      expiresAt: data.expiresAt,
      originalPurchaseDate:
        data.originalPurchaseDate || user.subscription?.originalPurchaseDate,
      willRenew: data.willRenew,
      revenuecatId: user.subscription?.revenuecatId,
      periodType: data.periodType,
      trialStartDate: isStartingTrial
        ? new Date()
        : user.subscription?.trialStartDate,
      trialEndDate: isStartingTrial
        ? data.expiresAt
        : user.subscription?.trialEndDate,
      trialReminderSent: isConvertingFromTrial
        ? false
        : user.subscription?.trialReminderSent || false,
    };
    user.markModified('subscription');
    await user.save();

    if (isStartingTrial) {
      this.logger.log(
        `Trial started for user ${user._id}, ends at ${data.expiresAt}`,
      );
    } else if (isConvertingFromTrial) {
      this.logger.log(
        `Trial converted to paid subscription for user ${user._id}`,
      );
    } else {
      this.logger.log(`Subscription activated for user ${user._id}`);
    }
  }

  private async cancelSubscription(user: UserDocument): Promise<void> {
    if (user.subscription) {
      user.subscription.status = SubscriptionStatus.CANCELLED;
      user.subscription.willRenew = false;
      user.markModified('subscription');
      await user.save();
      this.logger.log(`Subscription cancelled for user ${user._id}`);
    }
  }

  private async expireSubscription(user: UserDocument): Promise<void> {
    if (user.subscription) {
      user.subscription.status = SubscriptionStatus.EXPIRED;
      user.subscription.willRenew = false;
      user.markModified('subscription');
      await user.save();
      this.logger.log(`Subscription expired for user ${user._id}`);
    }
  }

  private async setGracePeriod(user: UserDocument): Promise<void> {
    if (user.subscription) {
      user.subscription.status = SubscriptionStatus.GRACE_PERIOD;
      user.markModified('subscription');
      await user.save();
      this.logger.log(`Subscription in grace period for user ${user._id}`);
    }
  }

  async getSubscriptionStatus(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const subscription = user.subscription || {
      status: SubscriptionStatus.NONE,
      willRenew: false,
      periodType: SubscriptionPeriodType.NORMAL,
      productId: undefined as string | undefined,
      expiresAt: undefined as Date | undefined,
      trialStartDate: undefined as Date | undefined,
      trialEndDate: undefined as Date | undefined,
    };

    // Check if expired
    let isPremium = false;
    if (
      subscription.status === SubscriptionStatus.ACTIVE ||
      subscription.status === SubscriptionStatus.GRACE_PERIOD
    ) {
      if (subscription.expiresAt) {
        isPremium = new Date() < new Date(subscription.expiresAt);
      } else {
        isPremium = true;
      }
    }

    // Check if currently on trial
    const isOnTrial =
      isPremium && subscription.periodType === SubscriptionPeriodType.TRIAL;

    // Calculate trial days remaining
    let trialDaysRemaining: number | undefined;
    if (isOnTrial && subscription.trialEndDate) {
      const now = new Date();
      const trialEnd = new Date(subscription.trialEndDate);
      const diffMs = trialEnd.getTime() - now.getTime();
      trialDaysRemaining = Math.max(
        0,
        Math.ceil(diffMs / (1000 * 60 * 60 * 24)),
      );
    }

    return {
      isPremium,
      status: subscription.status,
      productId: subscription.productId,
      expiresAt: subscription.expiresAt,
      willRenew: subscription.willRenew,
      periodType: subscription.periodType,
      isOnTrial,
      trialStartDate: subscription.trialStartDate,
      trialEndDate: subscription.trialEndDate,
      trialDaysRemaining,
    };
  }

  async syncSubscription(
    userId: string,
    data: {
      productId: string;
      expiresAt?: Date;
      isActive: boolean;
      periodType?: string;
    },
  ): Promise<UserDocument> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const periodType = this.mapPeriodType(
      (data.periodType?.toUpperCase() || 'NORMAL') as
        | 'TRIAL'
        | 'INTRO'
        | 'NORMAL',
    );
    const isStartingTrial =
      periodType === SubscriptionPeriodType.TRIAL &&
      user.subscription?.periodType !== SubscriptionPeriodType.TRIAL;

    user.subscription = {
      status: data.isActive
        ? SubscriptionStatus.ACTIVE
        : SubscriptionStatus.EXPIRED,
      productId: data.productId,
      expiresAt: data.expiresAt,
      originalPurchaseDate:
        user.subscription?.originalPurchaseDate || new Date(),
      willRenew: data.isActive,
      revenuecatId: user.subscription?.revenuecatId,
      periodType,
      trialStartDate: isStartingTrial
        ? new Date()
        : user.subscription?.trialStartDate,
      trialEndDate: isStartingTrial
        ? data.expiresAt
        : user.subscription?.trialEndDate,
      trialReminderSent: user.subscription?.trialReminderSent || false,
    };
    user.markModified('subscription');
    await user.save();

    return user;
  }

  // Get users whose trial ends within specified days and haven't received reminder
  async getUsersWithTrialEndingSoon(
    withinDays: number = 1,
  ): Promise<UserDocument[]> {
    const now = new Date();
    const cutoffDate = new Date(
      now.getTime() + withinDays * 24 * 60 * 60 * 1000,
    );

    return this.userModel.find({
      'subscription.periodType': SubscriptionPeriodType.TRIAL,
      'subscription.status': SubscriptionStatus.ACTIVE,
      'subscription.trialEndDate': { $lte: cutoffDate, $gte: now },
      'subscription.trialReminderSent': false,
    });
  }

  // Mark that trial reminder was sent
  async markTrialReminderSent(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      'subscription.trialReminderSent': true,
    });
    this.logger.log(`Trial reminder marked as sent for user ${userId}`);
  }

  // Daily at 10:00 - send trial ending reminders (1 day before trial ends)
  @Cron('0 0 10 * * *')
  async sendTrialEndingReminders() {
    try {
      const usersWithTrialEndingSoon =
        await this.getUsersWithTrialEndingSoon(1);

      this.logger.log(
        `Found ${usersWithTrialEndingSoon.length} users with trial ending soon`,
      );

      for (const user of usersWithTrialEndingSoon) {
        try {
          await this.notificationsService.sendPushNotification(
            user._id.toString(),
            {
              title: 'Your trial ends tomorrow!',
              body: "Don't lose access to premium features. Your subscription will start automatically.",
              sound: 'default',
            },
            { onEngagementPushes: true },
          );

          await this.markTrialReminderSent(user._id.toString());
          this.logger.log(`Trial reminder sent to user ${user._id}`);
        } catch (err) {
          this.logger.error(
            `Failed to send trial reminder to user ${user._id}:`,
            err,
          );
        }
      }
    } catch (error) {
      this.logger.error('Trial reminder cron error:', error);
    }
  }
}
