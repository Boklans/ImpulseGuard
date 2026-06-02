import { AchievementConfig } from '../config/achievements.config';

export class NewAchievementDto {
  ownerUserId: string;
  achievementRefs: AchievementConfig[];
}
