import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type EggDocument = HydratedDocument<Egg>;

@Schema()
export class Egg {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerUserId: Types.ObjectId;

  @Prop({
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary'],
    default: 'common',
  })
  rarity: string;

  @Prop({ default: () => Date.now() })
  createdAt: Date;

  @Prop({ default: null })
  hatchStartTime: Date | null;

  @Prop({ default: null })
  hatchEndTime: Date | null;

  @Prop({ default: false })
  isHatched: boolean;

  @Prop({ type: String })
  imageUrl: string;

  @Prop({ required: true })
  hatchDurationMs: number;
}

export const EggSchema = SchemaFactory.createForClass(Egg);
