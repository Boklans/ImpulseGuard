import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema({ _id: false })
class NotificationSettings {
  @Prop({ default: true })
  onLevelUp: boolean;

  @Prop({ default: true })
  onAchievement: boolean;

  @Prop({ default: true })
  onStreakWarning: boolean;

  @Prop({ default: true })
  onWeeklySummary: boolean;

  @Prop({ default: true })
  onEngagementPushes: boolean;

  @Prop({ default: true })
  onEggReady: boolean;

  @Prop({ default: true })
  onPetHatched: boolean;

  @Prop({ default: true })
  onPetNeeds: boolean;

  @Prop({ default: true })
  onMissedFirstSession: boolean;
}

const NotificationSettingsSchema =
  SchemaFactory.createForClass(NotificationSettings);

@Schema()
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  ownerUserId: Types.ObjectId;

  @Prop({ type: NotificationSettingsSchema, default: () => ({}) })
  settings: NotificationSettings;

  @Prop()
  pushToken: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
