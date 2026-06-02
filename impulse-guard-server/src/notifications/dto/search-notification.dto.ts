import { PartialType } from '@nestjs/mapped-types';
import { CreateNotificationSettingsDto } from './create-notification.dto';

export class SearchNotificationDto extends PartialType(
  CreateNotificationSettingsDto,
) {}
