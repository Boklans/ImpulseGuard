import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  BuyEggResult,
  EggPrices,
  SellEggResult,
  ShopService,
} from './shop.service';
import { UserDec } from 'src/auth/decorators/user.decorator';
import { UserPayload } from 'src/auth/payloads/user.payload';
import { BuyEggDto } from './dto/buy-egg.dto';

@Controller('shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Get('prices')
  getPrices(): EggPrices {
    return this.shopService.getEggPrices();
  }

  @Post('eggs/sell/:eggId')
  sellEgg(
    @Param('eggId') eggId: string,
    @UserDec() user: UserPayload,
  ): Promise<SellEggResult> {
    return this.shopService.sellEgg(eggId, user.id);
  }

  @Post('eggs/buy')
  buyEgg(
    @Body() buyEggDto: BuyEggDto,
    @UserDec() user: UserPayload,
  ): Promise<BuyEggResult> {
    return this.shopService.buyEgg(buyEggDto.rarity, user.id);
  }
}
