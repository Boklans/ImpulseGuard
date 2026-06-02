import { DynamicModule, Module, Provider } from '@nestjs/common';
import { RewardsPolicy } from './interfaces';
import { RNG } from './rewards-engine';
import { RewardsService } from './rewards.service';
import { REWARDS_POLICY, REWARDS_RNG } from './tokens';

@Module({})
export class RewardsModule {
  static forRoot(policy?: RewardsPolicy, rng?: RNG): DynamicModule {
    const providers: Provider[] = [
      RewardsService,
      { provide: REWARDS_POLICY, useValue: policy ?? {} },
      { provide: REWARDS_RNG, useValue: rng ?? Math.random },
    ];
    return {
      module: RewardsModule,
      providers,
      exports: [RewardsService, REWARDS_POLICY, REWARDS_RNG],
    };
  }
}
