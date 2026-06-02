export class CreatePetDto {
  ownerUserId: string;
  name?: string;
  level?: number;
  currentXP?: number;
  maxHealth?: number;
  currentHealth?: number;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  evolutionLine?: number;
}
