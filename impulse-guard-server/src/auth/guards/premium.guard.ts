import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PREMIUM_KEY } from '../decorators/premium.decorator';
import { SubscriptionStatus } from 'src/users/schema/user.schema';

@Injectable()
export class PremiumGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const requiresPremium = this.reflector.getAllAndOverride<boolean>(
      IS_PREMIUM_KEY,
      [ctx.getHandler(), ctx.getClass()],
    );

    if (!requiresPremium) {
      return true;
    }

    const request = ctx.switchToHttp().getRequest();
    const user = request.user?.user;

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    const subscription = user.subscription;
    if (!subscription) {
      throw new ForbiddenException('Premium subscription required');
    }

    const isActive =
      subscription.status === SubscriptionStatus.ACTIVE ||
      subscription.status === SubscriptionStatus.GRACE_PERIOD;

    if (!isActive) {
      throw new ForbiddenException('Premium subscription required');
    }

    // Check expiration
    if (
      subscription.expiresAt &&
      new Date() > new Date(subscription.expiresAt)
    ) {
      throw new ForbiddenException('Premium subscription has expired');
    }

    return true;
  }
}
