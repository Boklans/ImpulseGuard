import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ImpulseDocument = HydratedDocument<Impulse>;

@Schema()
export class Impulse {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop()
  avatarUrl: string;

  @Prop({ default: 0 })
  sessionsCount: number;

  @Prop({ default: 0 })
  successCount: number;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const ImpulseSchema = SchemaFactory.createForClass(Impulse);
