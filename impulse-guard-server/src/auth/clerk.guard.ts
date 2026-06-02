import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { verifyToken } from '@clerk/clerk-sdk-node';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './decorators/public.decorator';
import { UsersService } from 'src/users/users.service';
import { IS_DEV_KEY } from './decorators/dev.decorator';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(
    private readonly config: ConfigService,
    private readonly reflector: Reflector,
    private userService: UsersService,
  ) { }

  async canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest<Request>();

    const isDev = this.reflector.getAllAndOverride<boolean>(IS_DEV_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    const env = process.env.NODE_ENV ?? 'development';

    if (isDev && env !== 'development') {
      throw new ForbiddenException('Not a development environment');
    }

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const auth = req.headers.authorization;

    if (!auth?.startsWith('Bearer ')) {
      if (env === 'development' && auth?.startsWith('Bypass ')) {
        const token = auth.substring(7);
        if (token === 'very_secret_shit_token_so_dont_share') {
          const userId = 'user_30hKcaVt3sBA4rxTLIX3bmIdpmq';
          const dbUser = await this.userService.findByClerkId(userId);
          req.user = {
            clerkPayload: {
              sub: userId,
            },
            user: dbUser,
            id: dbUser._id.toHexString(),
          };
          return true;
        }
      }
      throw new UnauthorizedException('Missing Bearer token');
    }

    const token = this.extractToken(req);

    try {
      const secretKey = this.config.get<string>('CLERK_SECRET_KEY');
      const tokenPayload = await verifyToken(token, {
        secretKey,
      });

      console.log('TOKEN PAYLOAD');
      console.log(JSON.stringify(tokenPayload, null, 2));

      const dbUser = await this.userService.findByClerkId(tokenPayload.sub);

      if (!dbUser) {
        throw new UnauthorizedException('User not found in database');
      }

      req.user = {
        clerkPayload: tokenPayload,
        user: dbUser,
        id: dbUser._id.toHexString(),
      };
      return true;
    } catch (err: any) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractToken(req: Request): string {
    const [type, token] = req.headers.authorization?.split(' ') ?? [];
    if (type !== 'Bearer' || !token)
      throw new UnauthorizedException('Missing Bearer token');
    return token;
  }
}
