import { forwardRef, Module } from '@nestjs/common';
import { BossesService } from './bosses.service';
import { BossesController } from './bosses.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Boss, BossSchema } from './schema/boss.schema';
import { PetsModule } from 'src/pets/pets.module';
import { UsersModule } from 'src/users/users.module';
import { StatisticsModule } from 'src/statistics/statistics.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { RewardsModule } from 'src/rewards/rewards.module';

@Module({
  imports: [
    RewardsModule.forRoot({
      defaultAmount: 3,
      ensure: ['glims'],
      maybe: [['egg', 0.4]],
    }),
    MongooseModule.forFeature([{ name: Boss.name, schema: BossSchema }]),
    forwardRef(() => PetsModule),
    forwardRef(() => UsersModule),
    StatisticsModule,
    NotificationsModule,
  ],
  controllers: [BossesController],
  providers: [BossesService],
  exports: [BossesService],
})
export class BossesModule {}
