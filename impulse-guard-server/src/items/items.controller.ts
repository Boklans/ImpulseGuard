import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import { ItemsService } from './items.service';
import { DevOnly } from 'src/auth/decorators/dev.decorator';
import { UserDec } from 'src/auth/decorators/user.decorator';
import { UserPayload } from 'src/auth/payloads/user.payload';
import { ItemsKey } from './config/items.config';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post()
  @DevOnly()
  create(@Body() createItemDto: CreateItemDto) {
    return this.itemsService.create(createItemDto);
  }

  @Post('use')
  useItem(
    @Body() useItemDto: { petId: string; itemRef: ItemsKey },
    @UserDec() user: UserPayload,
  ) {
    return this.itemsService.useItem(
      user.id,
      useItemDto.petId,
      useItemDto.itemRef,
    );
  }

  @Get()
  findAll(
    @Query('userId') userId: string,
    @Query('limit') limit = 10,
    @Query('page') page = 1,
    @UserDec() user: UserPayload,
  ) {
    return this.itemsService.findAll(user.id, Number(limit), Number(page));
  }

  @Get(':id')
  findOne(@Param('id') id: string, @UserDec() user: UserPayload) {
    return this.itemsService.findOne(id, user);
  }

  @Delete(':id')
  @DevOnly()
  remove(@Param('id') id: string) {
    return this.itemsService.remove(id);
  }
}
