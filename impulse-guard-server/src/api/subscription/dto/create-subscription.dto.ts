import { PlatformType } from '../model/platform-type';

export interface CreateSubscriptionDto {
  email: string;
  platform: PlatformType;
  ip: string;
  language?: string;
}
