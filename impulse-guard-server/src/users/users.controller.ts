import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { DevOnly } from 'src/auth/decorators/dev.decorator';
import { UserPayload } from 'src/auth/payloads/user.payload';
import { UserDec } from 'src/auth/decorators/user.decorator';
import { Premium } from 'src/auth/decorators/premium.decorator';
import { PremiumGuard } from 'src/auth/guards/premium.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('level-rewards')
  getLevelRewards(@UserDec() user: UserPayload) {
    return this.usersService.getLevelRewards(user.id);
  }

  @Post('claim-reward')
  claimReward(
    @Body() { level }: { level: number },
    @UserDec() user: UserPayload,
  ) {
    if (level === undefined || level === null)
      throw new BadRequestException('Люся, ти дєбіл');
    return this.usersService.claimReward(user.id, level, false);
  }

  @Post('claim-reward-premium')
  @UseGuards(PremiumGuard)
  @Premium()
  claimRewardPremium(
    @Body() { level }: { level: number },
    @UserDec() user: UserPayload,
  ) {
    if (level === undefined || level === null)
      throw new BadRequestException('Люся, ти дєбіл');
    return this.usersService.claimReward(user.id, level, true);
  }

  @Get()
  @DevOnly()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string, @UserDec() user: UserPayload) {
    return this.usersService.findOneById(user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @UserDec() user: UserPayload,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(user.id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @UserDec() user: UserPayload) {
    return this.usersService.remove(user.id);
  }

  @Post(':id/streak-goal')
  setStreakGoal(
    @Param('id') id: string,
    @UserDec() user: UserPayload,
    @Body('goal') goal: number,
  ) {
    return this.usersService.setStreakGoal(user.id, goal);
  }

  @Post(':id/streak-goal/decline')
  declineStreakGoal(@Param('id') id: string, @UserDec() user: UserPayload) {
    return this.usersService.declineStreakGoal(user.id);
  }

  @Post(':id/check-streak')
  checkStreak(@Param('id') userId: string, @UserDec() user: UserPayload) {
    return this.usersService.checkStreak(user.id);
  }
}
