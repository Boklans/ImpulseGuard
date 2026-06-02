import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type StatisticDocument = HydratedDocument<Statistic>;

@Schema({ _id: false })
class Stats {
  @Prop({ default: 0 })
  successfulSessions: number;

  @Prop({ default: 0 })
  longestStreak: number;

  @Prop({ default: 0 })
  currentStreak: number;

  @Prop({ default: 0 })
  eggsHatched: number;

  @Prop({ default: 0 })
  notesCreated: number;

  @Prop({ default: 0 })
  bossWins: number;
}

const StatsSchema = SchemaFactory.createForClass(Stats);

@Schema()
export class Statistic {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  ownerUserId: Types.ObjectId;

  @Prop({ type: StatsSchema, default: () => ({}) })
  stats: Stats;

  @Prop({ default: 0 })
  retriesAfterFail: number;

  @Prop({ default: 0 })
  eggsObtained: number;

  @Prop({ default: 0 })
  createdNotes: number;

  @Prop({ default: 0 })
  tasksCompleted: number;

  @Prop({
    type: Map,
    of: [Date],
    default: () => new Map<string, Date[]>(),
  })
  impulseDates: Map<string, Date[]>;
}

export const StatisticSchema = SchemaFactory.createForClass(Statistic);
