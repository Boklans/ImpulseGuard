import { LevelRewardType } from 'src/users/config/level-rewards.config';

export type RewardsPolicy = {
  defaultAmount?: number;
  ensure?: LevelRewardType[];
  maybe?: [LevelRewardType, number][];
};
