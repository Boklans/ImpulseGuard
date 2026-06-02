import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  BOSS_CONFIG,
  BOSS_KEYS,
  BossConfig,
  BossKey,
} from '../config/bosses.config';

export type BossDocument = HydratedDocument<Boss>;

@Schema()
export class Boss {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  ownerUserId: Types.ObjectId;
  @Prop({
    type: String,
    enum: BOSS_KEYS,
    default: BOSS_KEYS[0],
  })
  bossRef: BossKey;

  public boss?: BossConfig;

  @Prop({
    type: [
      {
        type: Types.ObjectId,
        ref: 'Pet', // Reference to the Pet collection
      },
    ],
    default: [], // Initialize as empty array
    validate: {
      // Custom validator to prevent duplicates
      validator: function (pets: Types.ObjectId[]) {
        const ids = pets.map((id) => id.toString());
        return new Set(ids).size === ids.length;
      },
      message: 'Duplicate pets found in assignedPets array',
    },
  })
  assignedPets: Types.ObjectId[];
  @Prop({ default: 0 })
  currentHealth: number;
  @Prop({ default: 0 })
  currentDamage: number;
  @Prop({ default: 0 })
  level: number;
  @Prop({ default: () => new Date() })
  lastTimeWasDamaged: Date;
  @Prop({ default: 0 })
  currentStage: number;
}

export const BossSchema = SchemaFactory.createForClass(Boss);

BossSchema.index({ ownerUserId: 1, bossRef: 1 }, { unique: true });
BossSchema.virtual('boss').get(function () {
  return BOSS_CONFIG[this.bossRef];
});
