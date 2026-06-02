import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import Expo from 'expo-server-sdk';
import {
  Notification,
  NotificationDocument,
} from './schema/notification.schema';
import { Model, Types } from 'mongoose';
import { CreateNotificationSettingsDto } from './dto/create-notification.dto';
import { SearchNotificationDto } from './dto/search-notification.dto';
import { SendNotificationDto } from './dto/send-notification.dto';

@Injectable()
export class NotificationsService {
  expo: Expo;

  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
    private readonly configService: ConfigService,
  ) {
    this.expo = new Expo({
      accessToken: this.configService.get<string>('EXPO_TOKEN'),
    });
  }

  async sendPushNotifications(
    dto: SendNotificationDto,
    search: SearchNotificationDto,
  ) {
    const messages = (await this.findPushTokensWithFilter(search)).map(
      (pushToken) => {
        return {
          to: pushToken,
          ...dto,
        };
      },
    );
    return this.expo.sendPushNotificationsAsync(messages);
  }

  async sendPushNotification(
    userId: string,
    dto: SendNotificationDto,
    search: SearchNotificationDto,
  ) {
    const settings = await this.findSettings(userId);
    if (!settings) {
      console.warn("Can't find settings for user", userId);
      return { success: false, reason: 'no_settings' };
    }

    if (!settings.pushToken) {
      console.warn('No push token for user', userId);
      return { success: false, reason: 'no_push_token' };
    }

    // Check if notification type is disabled - if so, don't send
    if (!settings.settings.onAchievement && !!search.onAchievement) {
      return { success: false, reason: 'onAchievement_disabled' };
    }
    if (!settings.settings.onLevelUp && !!search.onLevelUp) {
      return { success: false, reason: 'onLevelUp_disabled' };
    }
    if (!settings.settings.onStreakWarning && !!search.onStreakWarning) {
      return { success: false, reason: 'onStreakWarning_disabled' };
    }
    if (!settings.settings.onWeeklySummary && !!search.onWeeklySummary) {
      return { success: false, reason: 'onWeeklySummary_disabled' };
    }
    if (!settings.settings.onEngagementPushes && !!search.onEngagementPushes) {
      return { success: false, reason: 'onEngagementPushes_disabled' };
    }
    if (!settings.settings.onEggReady && !!search.onEggReady) {
      return { success: false, reason: 'onEggReady_disabled' };
    }
    if (!settings.settings.onPetHatched && !!search.onPetHatched) {
      return { success: false, reason: 'onPetHatched_disabled' };
    }
    if (!settings.settings.onPetNeeds && !!search.onPetNeeds) {
      return { success: false, reason: 'onPetNeeds_disabled' };
    }
    if (
      !settings.settings.onMissedFirstSession &&
      !!search.onMissedFirstSession
    ) {
      return { success: false, reason: 'onMissedFirstSession_disabled' };
    }

    // Send notification
    const tickets = await this.expo.sendPushNotificationsAsync([
      {
        to: settings.pushToken,
        ...dto,
      },
    ]);
    return { success: true, tickets };
  }

  async findPushTokensWithFilter(
    dto: SearchNotificationDto,
  ): Promise<string[]> {
    // Build query for settings that match the requested notification type
    const query: Record<string, boolean> = {};
    if (dto.onAchievement) query['settings.onAchievement'] = true;
    if (dto.onLevelUp) query['settings.onLevelUp'] = true;
    if (dto.onStreakWarning) query['settings.onStreakWarning'] = true;
    if (dto.onWeeklySummary) query['settings.onWeeklySummary'] = true;
    if (dto.onEngagementPushes) query['settings.onEngagementPushes'] = true;
    if (dto.onEggReady) query['settings.onEggReady'] = true;
    if (dto.onPetHatched) query['settings.onPetHatched'] = true;
    if (dto.onPetNeeds) query['settings.onPetNeeds'] = true;
    if (dto.onMissedFirstSession) query['settings.onMissedFirstSession'] = true;

    const documents = await this.notificationModel
      .find({
        pushToken: { $exists: true, $ne: null },
        ...query,
      })
      .exec();
    return documents.map((value) => value.pushToken);
  }

  async findSettings(userId: string): Promise<Notification> {
    const objectId = new Types.ObjectId(userId);

    // Try to find existing settings
    const settings = await this.notificationModel
      .findOne({
        ownerUserId: objectId,
      })
      .exec();

    // Return if found
    if (settings) {
      return settings;
    }

    // Create new settings with defaults
    const newSettings = new this.notificationModel({
      ownerUserId: objectId,
      // Other fields will use schema defaults
    });

    return newSettings.save();
  }

  async createOrUpdateSettings(
    dto: CreateNotificationSettingsDto,
  ): Promise<Notification> {
    const {
      userId,
      pushToken,
      onLevelUp,
      onAchievement,
      onStreakWarning,
      onWeeklySummary,
      onEngagementPushes,
      onEggReady,
      onPetHatched,
      onPetNeeds,
      onMissedFirstSession,
    } = dto;

    const settings = {
      onLevelUp,
      onAchievement,
      onStreakWarning,
      onWeeklySummary,
      onEngagementPushes,
      onEggReady,
      onPetHatched,
      onPetNeeds,
      onMissedFirstSession,
    };

    const notification = await this.notificationModel.findOne({
      ownerUserId: new Types.ObjectId(userId),
    });

    if (!notification) {
      if (!pushToken) {
        throw new BadRequestException(
          'Push token is required in order to create settings',
        );
      }
      return this.notificationModel.create({
        pushToken,
        settings,
        ownerUserId: new Types.ObjectId(userId),
      });
    }

    // Build update object - only include fields that are provided
    const updateData: Record<string, any> = {};
    if (pushToken) {
      updateData.pushToken = pushToken;
    }
    // Update settings fields that are explicitly provided
    Object.entries(settings).forEach(([key, value]) => {
      if (value !== undefined) {
        updateData[`settings.${key}`] = value;
      }
    });

    return this.notificationModel
      .findOneAndUpdate(
        { ownerUserId: new Types.ObjectId(userId) },
        { $set: updateData },
        { new: true },
      )
      .exec();
  }
}
