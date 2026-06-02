export class SendNotificationDto {
  title: string;
  body: string;
  sound?: string;
  data?: {
    id: string;
    [key: string]: unknown;
  };
}
