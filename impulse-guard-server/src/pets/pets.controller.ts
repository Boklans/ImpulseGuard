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
import { PetsService } from './pets.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { DevOnly } from 'src/auth/decorators/dev.decorator';
import { UserDec } from 'src/auth/decorators/user.decorator';
import { UserPayload } from 'src/auth/payloads/user.payload';

@Controller('pets')
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Post()
  @DevOnly()
  create(@Body() createPetDto: CreatePetDto) {
    return this.petsService.create(createPetDto);
  }

  @Post(':id/revive')
  revivePet(@UserDec() user: UserPayload, @Param('id') id: string) {
    return this.petsService.revivePet(id, user.id);
  }

  @Get()
  findAll(
    @Query('limit') limit = 10,
    @Query('page') page = 1,
    @Query('aliveOnly') aliveOnly = 'false',
    @UserDec() user: UserPayload,
  ) {
    return this.petsService.findAll(
      user.id,
      Number(limit),
      Number(page),
      aliveOnly === 'false' ? false : true,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @UserDec() user: UserPayload) {
    return this.petsService.findOneAndValidateUser(id, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePetDto: UpdatePetDto,
    @UserDec() payload: UserPayload,
  ) {
    return this.petsService.update(id, updatePetDto, payload.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @UserDec() payload: UserPayload) {
    return this.petsService.validateUserAndRemove(id, payload.id);
  }
}
