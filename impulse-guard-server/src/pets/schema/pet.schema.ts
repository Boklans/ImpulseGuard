import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PetDocument = HydratedDocument<Pet>;

export enum PetRarity {
  COMMON = 'common',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

@Schema()
export class Pet {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerUserId: Types.ObjectId;

  @Prop({ default: 'My Pet' })
  name: string;

  @Prop()
  imageUrl: string;

  @Prop({ min: 1, max: 10 })
  evolutionLine: number;

  @Prop({ min: 1, max: 4, default: 1 })
  stage: number;

  @Prop()
  evolvedAt?: Date;

  @Prop({ default: 1 })
  level: number;

  @Prop({ default: 0 })
  currentXP: number;

  @Prop({ default: 100 })
  xpForNextLevel: number;

  @Prop({ default: 100 })
  maxHealth: number;

  @Prop({ default: 100 })
  currentHealth: number;

  @Prop({ default: 10 })
  maxEnergy: number;

  @Prop({ default: 10 })
  currentEnergy: number;

  @Prop({ default: true })
  isActive: boolean; // For hp

  @Prop({ default: 0 })
  friendship: number;

  @Prop({ default: 0 })
  currentFriendshipXp: number;

  @Prop({ type: Object })
  traits: Record<string, any>;

  @Prop({ default: false })
  isFavorite: boolean;

  @Prop({
    type: String,
    enum: Object.values(PetRarity),
    default: PetRarity.COMMON,
  })
  rarity: PetRarity;

  @Prop({ default: () => Date.now() })
  createdAt: Date;

  @Prop({ default: () => Date.now() })
  updatedAt: Date;

  isValid() {
    return this.isActive && this.currentEnergy > 0 && this.currentHealth > 0;
  }
}

export const PetSchema = SchemaFactory.createForClass(Pet);
