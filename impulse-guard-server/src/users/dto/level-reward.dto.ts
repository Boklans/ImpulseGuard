import { LevelReward } from '../config/level-rewards.config';

export class LevelRewardDto {
  level: number;
  claimed: boolean;
  claimedPremium: boolean;
  rewards: LevelReward;
}
