import { ITEMS_KEYS, ItemsKey } from 'src/items/config/items.config';

export const LEVEL_REWARD_TYPES: LevelRewardType[] = [
  'egg',
  'glims',
  ...(ITEMS_KEYS.map((v) => v.toLowerCase()) as LevelRewardType[]),
];
export type LevelRewardType = 'egg' | 'glims' | Lowercase<ItemsKey>;

export class LevelRewardConfig {
  type: LevelRewardType;
  amount: number;
}

export class LevelReward {
  basic: LevelRewardConfig[];
  premium: LevelRewardConfig[];
}

export const LEVEL_REWARDS: Record<number, LevelReward> = {
  1: { basic: [], premium: [] },
  2: {
    basic: [{ type: 'glims', amount: 100 }],
    premium: [{ type: 'egg', amount: 1 }],
  },
  3: {
    basic: [
      { type: 'egg', amount: 1 },
      { type: 'apple', amount: 1 },
    ],
    premium: [{ type: 'potion_energy_r', amount: 1 }],
  },
  4: {
    basic: [{ type: 'glims', amount: 150 }],
    premium: [{ type: 'frisbee', amount: 1 }],
  },
  5: {
    basic: [{ type: 'ball', amount: 1 }],
    premium: [{ type: 'sushi', amount: 1 }],
  },
  6: {
    basic: [{ type: 'glims', amount: 200 }],
    premium: [{ type: 'egg', amount: 1 }],
  },
  7: {
    basic: [{ type: 'ball', amount: 1 }],
    premium: [{ type: 'potion_health_r', amount: 1 }],
  },
  8: {
    basic: [
      { type: 'egg', amount: 1 },
      { type: 'potion_energy_c', amount: 1 },
    ],
    premium: [{ type: 'steak', amount: 1 }],
  },
  9: {
    basic: [{ type: 'burrito', amount: 1 }],
    premium: [{ type: 'laser_pointer', amount: 1 }],
  },
  10: {
    basic: [{ type: 'glims', amount: 250 }],
    premium: [{ type: 'ball', amount: 4 }],
  },
  11: {
    basic: [{ type: 'bubble_machine', amount: 1 }],
    premium: [{ type: 'egg', amount: 1 }],
  },
  12: {
    basic: [{ type: 'glims', amount: 300 }],
    premium: [{ type: 'potion_energy_e', amount: 1 }],
  },
  13: {
    basic: [
      { type: 'egg', amount: 1 },
      { type: 'potion_health_c', amount: 1 },
    ],
    premium: [{ type: 'giant_plush', amount: 1 }],
  },
  14: {
    basic: [{ type: 'glims', amount: 350 }],
    premium: [{ type: 'ramen', amount: 1 }],
  },
  15: {
    basic: [{ type: 'laser_pointer', amount: 1 }],
    premium: [{ type: 'potion_energy_e', amount: 1 }],
  },
  16: {
    basic: [{ type: 'glims', amount: 400 }],
    premium: [{ type: 'egg', amount: 1 }],
  },
  17: {
    basic: [{ type: 'juice', amount: 1 }],
    premium: [{ type: 'potion_health_e', amount: 1 }],
  },
  18: {
    basic: [
      { type: 'egg', amount: 1 },
      { type: 'burrito', amount: 2 },
    ],
    premium: [{ type: 'bubble_machine', amount: 1 }],
  },
  19: {
    basic: [{ type: 'ball', amount: 2 }],
    premium: [{ type: 'potion_health_e', amount: 1 }],
  },
  20: {
    basic: [{ type: 'glims', amount: 450 }],
    premium: [{ type: 'phoenix_feather', amount: 1 }],
  },
  21: {
    basic: [{ type: 'cube_puzzle', amount: 2 }],
    premium: [{ type: 'egg', amount: 1 }],
  },
  22: {
    basic: [{ type: 'glims', amount: 500 }],
    premium: [{ type: 'holo_ball', amount: 1 }],
  },
  23: {
    basic: [
      { type: 'egg', amount: 1 },
      { type: 'smoothie', amount: 2 },
    ],
    premium: [{ type: 'dragon_fruit', amount: 1 }],
  },
  24: {
    basic: [{ type: 'glims', amount: 550 }],
    premium: [{ type: 'potion_energy_l', amount: 1 }],
  },
  25: {
    basic: [{ type: 'steak', amount: 2 }],
    premium: [{ type: 'egg', amount: 1 }],
  },
  26: {
    basic: [{ type: 'glims', amount: 600 }],
    premium: [{ type: 'potion_health_l', amount: 1 }],
  },
  27: {
    basic: [{ type: 'potion_energy_l', amount: 2 }],
    premium: [{ type: 'drone_bird', amount: 1 }],
  },
  28: {
    basic: [
      { type: 'egg', amount: 1 },
      { type: 'robot_mouse', amount: 1 },
    ],
    premium: [{ type: 'magic_wand', amount: 1 }],
  },
  29: {
    basic: [{ type: 'burrito', amount: 2 }],
    premium: [{ type: 'unicorn_cake', amount: 1 }],
  },
  30: {
    basic: [{ type: 'glims', amount: 650 }],
    premium: [{ type: 'egg', amount: 1 }],
  },
  31: {
    basic: [{ type: 'potion_health_e', amount: 2 }],
    premium: [{ type: 'vr_headset', amount: 1 }],
  },
  32: {
    basic: [{ type: 'glims', amount: 700 }],
    premium: [{ type: 'potion_energy_l', amount: 1 }],
  },
  33: {
    basic: [
      { type: 'egg', amount: 1 },
      { type: 'burrito', amount: 3 },
    ],
    premium: [{ type: 'truffle', amount: 1 }],
  },
  34: {
    basic: [{ type: 'glims', amount: 750 }],
    premium: [{ type: 'potion_health_l', amount: 1 }],
  },
  35: {
    basic: [{ type: 'ball', amount: 3 }],
    premium: [{ type: 'egg', amount: 2 }],
  },
  36: {
    basic: [{ type: 'glims', amount: 800 }],
    premium: [{ type: 'phoenix_feather', amount: 1 }],
  },
  37: {
    basic: [{ type: 'rope', amount: 3 }],
    premium: [{ type: 'unicorn_plush', amount: 1 }],
  },
  38: {
    basic: [
      { type: 'egg', amount: 1 },
      { type: 'potion_energy_c', amount: 3 },
    ],
    premium: [{ type: 'golden_apple', amount: 1 }],
  },
  39: {
    basic: [{ type: 'drone_bird', amount: 3 }],
    premium: [{ type: 'potion_energy_l', amount: 2 }],
  },
  40: {
    basic: [
      { type: 'egg', amount: 2 },
      { type: 'phoenix_feather', amount: 3 },
      { type: 'glims', amount: 1000 },
    ],
    premium: [
      { type: 'egg', amount: 2 },
      { type: 'glims', amount: 2000 },
      { type: 'phoenix_feather', amount: 1 },
      { type: 'unicorn_plush', amount: 1 },
    ],
  },
};
