import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Statistic, StatisticSchema } from './schema/statistic.schema';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { AchievementsModule } from 'src/achievements/achievements.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Statistic.name, schema: StatisticSchema },
    ]),
    AchievementsModule,
  ],
  controllers: [StatisticsController],
  providers: [StatisticsService],
  exports: [StatisticsService],
})
export class StatisticsModule {}
