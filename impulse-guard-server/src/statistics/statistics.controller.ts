import { Controller, Get, Post, Query } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { UserDec } from 'src/auth/decorators/user.decorator';
import { UserPayload } from 'src/auth/payloads/user.payload';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get()
  find(@UserDec() user: UserPayload) {
    return this.statisticsService.getOrCreateByUser(user.id);
  }

  @Post('createNotes')
  createNotes(@Query('notes') notes: number, @UserDec() user: UserPayload) {
    return this.statisticsService.createNotes(user.id, notes);
  }

  @Post('completeTasks')
  completeTasks(@Query('tasks') tasks: number, @UserDec() user: UserPayload) {
    return this.statisticsService.completeTasks(user.id, tasks);
  }
}
