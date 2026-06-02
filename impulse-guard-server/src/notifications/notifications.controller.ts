import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationSettingsDto } from './dto/create-notification.dto';
import { SendNotificationDto } from './dto/send-notification.dto';
import { SearchNotificationDto } from './dto/search-notification.dto';
import { DevOnly } from 'src/auth/decorators/dev.decorator';
import { UserDec } from 'src/auth/decorators/user.decorator';
import { UserPayload } from 'src/auth/payloads/user.payload';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('settings')
  getSettings(@UserDec() user: UserPayload) {
    return this.notificationsService.findSettings(user.id);
  }

  @Post('settings')
  createSettings(
    @Body() dto: CreateNotificationSettingsDto,
    @UserDec() user: UserPayload,
  ) {
    return this.notificationsService.createOrUpdateSettings({
      ...dto,
      userId: user.id,
    });
  }

  @Patch('settings')
  updateSettings(
    @Body() dto: CreateNotificationSettingsDto,
    @UserDec() user: UserPayload,
  ) {
    return this.notificationsService.createOrUpdateSettings({
      ...dto,
      userId: user.id,
    });
  }

  @Post('debug-send')
  @DevOnly()
  async sendPushNotifications(
    @Body()
    {
      user,
      message,
      search,
    }: {
      user: string;
      message: SendNotificationDto;
      search: SearchNotificationDto;
    },
  ) {
    return this.notificationsService.sendPushNotification(
      user,
      message,
      search,
    );
  }

  @Post('test')
  @DevOnly()
  async testNotification(@UserDec() user: UserPayload) {
    return this.notificationsService.sendPushNotification(
      user.id,
      {
        title: 'Test Notification',
        body: 'If you see this, notifications are working!',
        sound: 'default',
        data: { id: 'test' },
      },
      {}, // no filter - always send
    );
  }
}
