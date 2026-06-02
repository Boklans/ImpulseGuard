import { ItemsKey } from '../config/items.config';

export class CreateItemDto {
  ownerUserId: string;
  itemRef: ItemsKey;
  amount?: number;
}
