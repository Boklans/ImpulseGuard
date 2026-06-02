import { forwardRef, Module } from '@nestjs/common';
import { EggsService } from './eggs.service';
import { EggsController } from './eggs.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Egg, EggSchema } from './schema/egg.schema';
import { StatisticsModule } from 'src/statistics/statistics.module';
import { PetsModule } from 'src/pets/pets.module';
import { UsersModule } from 'src/users/users.module';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Egg.name, schema: EggSchema }]),
    StatisticsModule,
    PetsModule,
    forwardRef(() => UsersModule),
    NotificationsModule,
  ],
  controllers: [EggsController],
  providers: [EggsService],
  exports: [EggsService],
})
export class EggsModule {}
