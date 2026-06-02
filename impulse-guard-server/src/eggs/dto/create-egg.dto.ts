export class CreateEggDto {
  ownerUserId: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  imageUrl?: string;
}
