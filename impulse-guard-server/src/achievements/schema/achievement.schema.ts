import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  AchievementConfig,
  ACHIEVEMENTS_CONFIG,
  AchievementsKey,
} from '../config/achievements.config';

export type AchievementDocument = HydratedDocument<Achievement>;

@Schema({
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  autoIndex: true,
})
export class Achievement {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  ownerUserId: Types.ObjectId;

  @Prop({
    type: String,
    enum: Object.keys(ACHIEVEMENTS_CONFIG) as AchievementsKey[],
    default: [],
  })
  achievementRef: AchievementsKey;

  @Prop({ default: () => Date.now() })
  unlockedAt: Date;

  // Virtual property for populated achievements
  public achievement?: AchievementConfig;
}

export const AchievementSchema = SchemaFactory.createForClass(Achievement);

// Index only on ownerUserId since that's our unique key
AchievementSchema.index(
  { ownerUserId: 1, achievementRef: 1 },
  { unique: true },
);

// Virtual that maps achievementRefs to actual config objects
AchievementSchema.virtual('achievement').get(function () {
  return ACHIEVEMENTS_CONFIG[this.achievementRef];
});
