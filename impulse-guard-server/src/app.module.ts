import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ApiModule } from './api/api.module';
import { UsersModule } from './users/users.module';
import { PetsModule } from './pets/pets.module';
import { AchievementsModule } from './achievements/achievements.module';
import { AuthModule } from './auth/auth.module';
import { ImpulsesModule } from './impulses/impulses.module';
import { EggsModule } from './eggs/eggs.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ItemsModule } from './items/items.module';
import { StatisticsModule } from './statistics/statistics.module';
import { NotificationsModule } from './notifications/notifications.module';
import { APP_GUARD } from '@nestjs/core';
import { ClerkAuthGuard } from './auth/clerk.guard';
import { BossesModule } from './bosses/bosses.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ShopModule } from './shop/shop.module';
import { BillingModule } from './billing/billing.module';

@Module({
  imports: [
    ApiModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}.local`,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URL'),
      }),
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 60,
        },
      ],
    }),
    UsersModule,
    PetsModule,
    AchievementsModule,
    AuthModule,
    ImpulsesModule,
    EggsModule,
    ItemsModule,
    StatisticsModule,
    NotificationsModule,
    BossesModule,
    ShopModule,
    BillingModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ClerkAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
