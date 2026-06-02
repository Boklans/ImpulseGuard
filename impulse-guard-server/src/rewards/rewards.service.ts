import { Inject, Injectable, Optional } from '@nestjs/common';
import {
  computeRewards,
  ImpulseReward,
  ImpulseRewardRanges,
  RNG,
} from './rewards-engine';
import { REWARDS_POLICY, REWARDS_RNG } from './tokens';
import { RewardsPolicy } from './interfaces';

@Injectable()
export class RewardsService {
  constructor(
    @Optional() @Inject(REWARDS_POLICY) private readonly policy?: RewardsPolicy,
    @Optional() @Inject(REWARDS_RNG) private readonly rng?: RNG,
  ) {}

  generate(input: {
    level: number;
    maxLevel: number;
    ranges: ImpulseRewardRanges;
    amount?: number;
    ensureOverride?: RewardsPolicy['ensure'];
    maybeOverride?: RewardsPolicy['maybe'];
    rngOverride?: RNG;
  }): ImpulseReward[] {
    const amount = input.amount ?? this.policy?.defaultAmount ?? 3;
    const ensure = input.ensureOverride ?? this.policy?.ensure ?? ['glims'];
    const maybe = input.maybeOverride ?? this.policy?.maybe ?? [['egg', 0.4]];
    const rng = input.rngOverride ?? this.rng ?? Math.random;

    return computeRewards({
      level: input.level,
      maxLevel: input.maxLevel,
      ranges: input.ranges,
      amount,
      ensure,
      maybe,
      rng,
    });
  }
}
