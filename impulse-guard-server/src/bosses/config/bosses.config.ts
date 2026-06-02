import { ImpulseRewardRanges } from 'src/impulses/impulses.service';

export const BOSS_MAXIMUM_LEVEL = 40;

export class BossConfig {
  constructor(
    public readonly imageId: number,
    public readonly name: string,
    public readonly description: string,
    public readonly baseHealth: number,
    public readonly baseDamage: number,
    public readonly scalingFormula: (
      self: BossConfig,
      userLevel: number,
    ) => {
      health: number;
      damage: number;
    },
    public readonly regenerationScalingFormula: (
      self: BossConfig,
      stage: number,
      totalHp: number,
      leftHp: number,
    ) => number = (self, stage, totalHp, leftHp) => {
      return (totalHp - leftHp) * ((0.6 / self.maximumStages) * (stage + 1));
    },
    public readonly maximumStages: number = 3,
    public readonly takesEnergy: number = 20,
    public readonly rewardMap: ImpulseRewardRanges = {
      egg: {
        min: 2,
        max: 10,
      },
      glims: {
        min: 400,
        max: 1200,
      },
      potion: {
        min: 2,
        max: 15,
      },
      toy: {
        min: 3,
        max: 20,
      },
      food: {
        min: 3,
        max: 20,
      },
      special: {
        min: 0,
        max: 3,
      },
    },
  ) {}
}

export const BOSS_CONFIG = {
  DOOMSCROLLUS: new BossConfig(
    1,
    'Doomscrollus',
    'A snake-like demon that hypnotizes with endless social media feeds.',
    100,
    10,
    (self, level) => ({
      health: self.baseHealth + level * 20, // getting warning about this being possible undefined
      damage: self.baseDamage + level * 2,
    }),
  ),
  SNACKZILLA: new BossConfig(
    2,
    'Snackzilla',
    'A monster made of snack packs and sweets that devours self-control.',
    120,
    8,
    (self, level) => ({
      health: self.baseHealth + level * 18,
      damage: self.baseDamage + level * 2.5,
    }),
  ),
  PROCRASTINATUS: new BossConfig(
    3,
    'Procrastinatus',
    'A slow giant that makes you put off even fighting it.',
    150,
    6,
    (self, level) => ({
      health: self.baseHealth + level * 15,
      damage: self.baseDamage + level * 1.5,
    }),
  ),
  RAGECORE: new BossConfig(
    4,
    'Ragecore',
    'A fiery entity that explodes every time you lose your patience.',
    90,
    15,
    (self, level) => ({
      health: self.baseHealth + level * 12,
      damage: self.baseDamage + level * 3,
    }),
  ),
  SHADOWBINGE: new BossConfig(
    5,
    'ShadowBinge',
    'A dark phantom of serial watching - one episode, two, a whole season.',
    110,
    9,
    (self, level) => ({
      health: self.baseHealth + level * 16,
      damage: self.baseDamage + level * 2.2,
    }),
  ),
  GHOST_OF_GUILT: new BossConfig(
    6,
    'Ghost of Guilt',
    'A ghost of past mistakes that drags you back and steals your mood.',
    130,
    7,
    (self, level) => ({
      health: self.baseHealth + level * 17,
      damage: self.baseDamage + level * 1.8,
    }),
  ),
  NICOBOT: new BossConfig(
    7,
    'Nicobot',
    'A robot-nemesis that convinces you to go back to your old habits.',
    125,
    11,
    (self, level) => ({
      health: self.baseHealth + level * 15,
      damage: self.baseDamage + level * 2,
    }),
  ),
  DRAINER: new BossConfig(
    8,
    'Drainer',
    'A slime-like energy vampire that sucks out motivation and willpower.',
    140,
    5,
    (self, level) => ({
      health: self.baseHealth + level * 14,
      damage: self.baseDamage + level * 1.5,
    }),
  ),
  IMPULSE_PRIME: new BossConfig(
    9,
    'Impulse Prime',
    'An embodiment of all impulses in one: a hybrid of instant gratifications.',
    160,
    12,
    (self, level) => ({
      health: self.baseHealth + level * 25,
      damage: self.baseDamage + level * 2.5,
    }),
  ),
  SELFDOUBTUS: new BossConfig(
    10,
    'SelfDoubtus',
    'An old wizard of self-doubt that weakens faith in oneself.',
    100,
    10,
    (self, level) => ({
      health: self.baseHealth + level * 18,
      damage: self.baseDamage + level * 2.2,
    }),
  ),
};

export type BossKey = keyof typeof BOSS_CONFIG;
export const BOSS_KEYS = Object.keys(BOSS_CONFIG) as BossKey[];
