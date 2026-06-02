import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ImpulsesService } from './impulses.service';
import { CreateImpulseDto } from './dto/create-impulse.dto';
import { UpdateImpulseDto } from './dto/update-impulse.dto';
import { FinishSessionDto } from './dto/finish-session.dto';
import { UserDec } from 'src/auth/decorators/user.decorator';
import { UserPayload } from 'src/auth/payloads/user.payload';

@Controller('impulses')
export class ImpulsesController {
  constructor(private readonly impulsesService: ImpulsesService) {}

  @Post()
  create(
    @Body() createImpulseDto: CreateImpulseDto,
    @UserDec() user: UserPayload,
  ) {
    return this.impulsesService.create({
      ...createImpulseDto,
      userId: user.id,
    });
  }

  @Get()
  find(
    @Query('userId') userId: string,
    @Query('limit') limit = 10,
    @Query('page') page = 1,
    @UserDec() user: UserPayload,
  ) {
    return this.impulsesService.findAll(user.id, Number(limit), Number(page));
  }

  @Get(':id')
  findOne(@Param('id') id: string, @UserDec() user: UserPayload) {
    return this.impulsesService.findOne(id, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateImpulseDto: UpdateImpulseDto,
    @UserDec() user: UserPayload,
  ) {
    return this.impulsesService.update(id, updateImpulseDto, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @UserDec() user: UserPayload) {
    return this.impulsesService.remove(id, user.id);
  }

  @Post(':id/finish-session')
  finishSession(
    @Body() body: FinishSessionDto,
    @Param('id') impulseId: string,
    @UserDec() user: UserPayload,
  ) {
    return this.impulsesService.finishSession({
      impulseId,
      userId: user.id,
      success: body.status,
      duration: body.duration,
      selectedPetId: body.selectedPetId,
    });
  }
}
