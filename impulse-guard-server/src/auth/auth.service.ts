import {
  Injectable,
  NotFoundException,
  RawBodyRequest,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UsersService } from 'src/users/users.service';
import { CreateUserDto, LoginUserDto } from 'src/users/dto/create-user.dto';
import { User, UserDocument } from 'src/users/schema/user.schema';
import { Request } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import { WebhookEvent } from '@clerk/clerk-sdk-node';
import { ConfigService } from '@nestjs/config';
import { Webhook } from 'svix';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async me(clerkId: string) {
    const user = await this.usersService.findByClerkId(clerkId);
    if (!user) throw new NotFoundException('User not found');
    return user.toJSON();
  }

  private verifyWebhookEvent(
    rawBody: Buffer,
    headers: Record<string, string>,
  ): WebhookEvent {
    const WEBHOOK_SECRET = this.configService.get<string>(
      'CLERK_WEBHOOK_SECRET',
    );
    if (!WEBHOOK_SECRET) {
      throw new Error('no WEBHOOK_SECRET in .env');
    }
    const svix_id = headers['svix-id'];
    const svix_timestamp = headers['svix-timestamp'] as string;
    const svix_signature = headers['svix-signature'] as string;
    if (!svix_id || !svix_timestamp || !svix_signature) {
      throw new Error('no svix headers');
    }
    const wh = new Webhook(WEBHOOK_SECRET);
    let evt: WebhookEvent;
    try {
      evt = wh.verify(rawBody, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      }) as WebhookEvent;
    } catch (error: any) {
      throw new Error('Webhook failed to verify');
    }
    const { id } = evt.data;
    const eventType = evt.type;

    return evt;
  }

  handleWebhookEvent(
    req: RawBodyRequest<Request>,
    headers: Record<string, string>,
  ) {
    const { data, type } = this.verifyWebhookEvent(req.rawBody, headers);

    switch (type) {
      case 'user.created':
        return this.userCreated(data);
      case 'user.updated':
        return this.userUpdated(data);
      case 'user.deleted':
        return this.userDeleted(data);
      default:
        throw new Error(`Unhandled Clerk webhook type: ${type}`);
    }
  }

  async userCreated(data: WebhookEvent['data']) {
    return this.usersService.createFromClerk(data);
  }

  async userUpdated(data: WebhookEvent['data']) {
    return this.usersService.updateFromClerk(data);
  }

  async userDeleted(data: WebhookEvent['data']) {
    return this.usersService.deleteByClerkId(data.id);
  }
}
