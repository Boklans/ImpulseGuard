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
import { EggsService } from './eggs.service';
import { CreateEggDto } from './dto/create-egg.dto';
import { UpdateEggDto } from './dto/update-egg.dto';
import { UserPayload } from 'src/auth/payloads/user.payload';
import { UserDec } from 'src/auth/decorators/user.decorator';
import { DevOnly } from 'src/auth/decorators/dev.decorator';

@Controller('eggs')
export class EggsController {
  constructor(private readonly eggsService: EggsService) {}

  @Post()
  @DevOnly()
  create(@Body() createEggDto: CreateEggDto) {
    return this.eggsService.create(createEggDto);
  }

  @Get()
  find(
    @Query('userId') userId: string,
    @Query('limit') limit = 10,
    @Query('page') page = 1,
    @UserDec() user: UserPayload,
  ) {
    return this.eggsService.findAll(user.id, Number(limit), Number(page));
  }

  @Get(':id')
  findOne(@Param('id') id: string, @UserDec() user: UserPayload) {
    return this.eggsService.findOne(id, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEggDto: UpdateEggDto,
    @UserDec() user: UserPayload,
  ) {
    return this.eggsService.update(id, updateEggDto, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @UserDec() user: UserPayload) {
    return this.eggsService.remove(id, user.id);
  }

  @Post(':id/hatchStart')
  hatchStart(@Param('id') id: string, @UserDec() user: UserPayload) {
    return this.eggsService.hatchStart(id, user.id);
  }

  @Post(':id/finishHatch')
  finishHatch(@Param('id') id: string, @UserDec() user: UserPayload) {
    return this.eggsService.finishHatch(id, user.id);
  }

  @Post(':id/quickHatch')
  quickHatch(@Param('id') id: string, @UserDec() user: UserPayload) {
    return this.eggsService.quickHatch(id, user.id);
  }
}
