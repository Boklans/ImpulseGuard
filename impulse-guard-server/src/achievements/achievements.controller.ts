import { Controller, Get, Query, Sse } from '@nestjs/common';
import { AchievementsService } from './achievements.service';
import { Observable } from 'rxjs';
import { UserDec } from 'src/auth/decorators/user.decorator';
import { UserPayload } from 'src/auth/payloads/user.payload';

@Controller('achievements')
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @Get('stream')
  @Sse()
  streamEvents(): Observable<MessageEvent> {
    return this.achievementsService.getEventStream();
  }

  @Get()
  find(
    @Query('limit') limit = 10,
    @Query('page') page = 1,
    @UserDec() user: UserPayload,
  ) {
    return this.achievementsService.findLimited(
      user.id,
      Number(limit),
      Number(page),
    );
  }
}
