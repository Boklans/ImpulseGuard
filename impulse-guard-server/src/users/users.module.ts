import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from './schema/user.schema';
import { StatisticsModule } from 'src/statistics/statistics.module';
import { AchievementsModule } from 'src/achievements/achievements.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { EggsModule } from 'src/eggs/eggs.module';
import { ItemsModule } from 'src/items/items.module';
import { ScheduleModule } from '@nestjs/schedule';
import { BossesModule } from 'src/bosses/bosses.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    StatisticsModule,
    AchievementsModule,
    NotificationsModule,
    EggsModule,
    ItemsModule,
    BossesModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
