import {
  ITEMS_CONFIG,
  ItemsKey,
  ItemType,
} from 'src/items/config/items.config';
import {
  LEVEL_REWARD_TYPES,
  LevelRewardType,
} from 'src/users/config/level-rewards.config';

export type RNG = () => number;

export type ImpulseReward = {
  type: LevelRewardType;
  kind?: ItemType;
  id?: number;
  amount: number;
};

export type ImpulseRewardRanges = {
  glims: { min: number; max: number };
  egg: { min: number; max: number };
  potion: { min: number; max: number };
  toy: { min: number; max: number };
  food: { min: number; max: number };
  special: { min: number; max: number };
};

export function getRandomAffectedByLevel(
  level: number,
  maxLevel: number,
  rng: RNG,
): number {
  const p = Math.max(0, Math.min(level / maxLevel, 1));
  const probAboveHalf = 0.2 + 0.7 * p;
  const base = 1 - probAboveHalf;
  const k = Math.log(0.5) / Math.log(base);
  return Math.pow(rng(), k);
}

export function getRandomInRangeAffectedByLevel(
  min: number,
  max: number,
  level: number,
  maxLevel: number,
  rng: RNG,
): number {
  return (
    Math.floor(
      getRandomAffectedByLevel(level, maxLevel, rng) * (max - min + 1),
    ) + min
  );
}

export function pickUniqueRewardTypes(
  amount: number,
  rng: RNG,
  ensure: LevelRewardType[] = ['glims'],
  maybe: [LevelRewardType, number][] = [['egg', 0.4]],
): LevelRewardType[] {
  const result = [...ensure];
  for (const [t, p] of maybe)
    if (rng() <= p && !result.includes(t)) result.push(t);

  const pool = LEVEL_REWARD_TYPES.slice();
  let guard = 100;
  while (result.length < amount && guard-- > 0) {
    const idx = Math.floor(rng() * pool.length);
    const pick = pool[idx];
    if (!result.includes(pick)) result.push(pick);
  }
  return result.slice(0, amount);
}

export function buildReward(
  type: LevelRewardType,
  level: number,
  maxLevel: number,
  ranges: ImpulseRewardRanges,
  rng: RNG,
): ImpulseReward {
  if (type === 'egg') {
    return {
      type,
      amount: getRandomInRangeAffectedByLevel(
        ranges.egg.min,
        ranges.egg.max,
        level,
        maxLevel,
        rng,
      ),
    };
  }
  if (type === 'glims') {
    return {
      type,
      amount: getRandomInRangeAffectedByLevel(
        ranges.glims.min,
        ranges.glims.max,
        level,
        maxLevel,
        rng,
      ),
    };
  }

  const itemInfo = ITEMS_CONFIG[type.toUpperCase() as ItemsKey];
  if (!itemInfo) throw new Error(`Unknown reward type: ${type}`);

  let min = 0,
    max = 0;
  switch (itemInfo.type) {
    case ItemType.Potion:
      ({ min, max } = ranges.potion);
      break;
    case ItemType.Food:
      ({ min, max } = ranges.food);
      break;
    case ItemType.Toy:
      ({ min, max } = ranges.toy);
      break;
    case ItemType.Special:
      ({ min, max } = ranges.special);
      break;
    default:
      throw new Error(`Unsupported item type: ${itemInfo.type}`);
  }

  return {
    type,
    id: itemInfo.imageId,
    kind: itemInfo.type,
    amount: getRandomInRangeAffectedByLevel(min, max, level, maxLevel, rng),
  };
}

export function computeRewards(opts: {
  level: number;
  maxLevel: number;
  ranges: ImpulseRewardRanges;
  amount?: number;
  rng?: RNG;
  ensure?: LevelRewardType[];
  maybe?: [LevelRewardType, number][];
}): ImpulseReward[] {
  const {
    level,
    maxLevel,
    ranges,
    amount = 3,
    rng = Math.random,
    ensure = ['glims'],
    maybe = [['egg', 0.4]],
  } = opts;

  const types = pickUniqueRewardTypes(amount, rng, ensure, maybe);

  // Build rewards for each type, filtering out zero amounts
  const rewards: ImpulseReward[] = [];
  for (const t of types) {
    const r = buildReward(t, level, maxLevel, ranges, rng);
    if (r.amount > 0) {
      rewards.push(r);
    }
  }

  return rewards;
}
