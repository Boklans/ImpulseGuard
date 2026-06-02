import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ImpulsesService } from './impulses.service';
import { ImpulsesController } from './impulses.controller';
import { Impulse, ImpulseSchema } from './schema/impulse.schema';
import { UsersModule } from 'src/users/users.module';

import { EggsModule } from 'src/eggs/eggs.module';
import { ItemsModule } from 'src/items/items.module';
import { PetsModule } from 'src/pets/pets.module';
import { StatisticsModule } from 'src/statistics/statistics.module';
import { RewardsModule } from 'src/rewards/rewards.module';

@Module({
  imports: [
    RewardsModule.forRoot({
      defaultAmount: 3,
      ensure: ['glims'],
      maybe: [['egg', 0.4]],
    }),
    MongooseModule.forFeature([{ name: Impulse.name, schema: ImpulseSchema }]),
    forwardRef(() => UsersModule),
    EggsModule,
    ItemsModule,
    PetsModule,
    StatisticsModule,
  ],
  controllers: [ImpulsesController],
  providers: [ImpulsesService],
  exports: [ImpulsesService],
})
export class ImpulsesModule {}
