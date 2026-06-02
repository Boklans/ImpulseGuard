import { IsIn, IsOptional } from 'class-validator';

export class BuyEggDto {
  @IsOptional()
  @IsIn(['common', 'rare', 'epic', 'legendary'])
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}
