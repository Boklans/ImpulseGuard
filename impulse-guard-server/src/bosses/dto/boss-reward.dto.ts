import { ImpulseReward } from 'src/impulses/impulses.service';
import { UserDocument } from 'src/users/schema/user.schema';

export type BossRewardDto = { user: UserDocument; rewards: ImpulseReward[] };
