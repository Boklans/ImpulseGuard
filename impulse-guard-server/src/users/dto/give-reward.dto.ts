import { EggDocument } from 'src/eggs/schema/egg.schema';
import { ItemDocument } from 'src/items/schema/item.schema';
import { UserDocument } from '../schema/user.schema';

export type GiveRewardDto = Array<
  { item: ItemDocument } | { egg: EggDocument } | { glims: number }
>;

export type GiveMultipleRewardsDto = {
  items: ItemDocument[];
  eggs: EggDocument[];
  user: UserDocument;
};
