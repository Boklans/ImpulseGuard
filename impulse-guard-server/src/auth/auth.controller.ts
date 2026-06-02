import { Controller, Post, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Headers, Res, RawBodyRequest, HttpStatus } from '@nestjs/common';
import { Response, Request } from 'express';
import { Public } from './decorators/public.decorator';
import { UserDec } from './decorators/user.decorator';
import { UserPayload } from './payloads/user.payload';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('webhooks')
  @Public()
  async webhooks(
    @Req() req: RawBodyRequest<Request>,
    @Res() response: Response,
    @Headers() headers: Record<string, string>,
  ) {
    try {
      await this.authService.handleWebhookEvent(req, headers);
      return response.status(HttpStatus.OK).json({
        success: true,
        message: 'Webhook received',
      });
    } catch (error: any) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: error.message,
      });
    }
  }

  @Get('me')
  async getMe(@UserDec() user: UserPayload) {
    return user.user.toJSON();
  }
}
