import { Controller /*, Get, Patch, Post, Query */ } from '@nestjs/common';
import { BossesService } from './bosses.service';
// import { UserPayload } from 'src/auth/payloads/user.payload';
// import { UserDec } from 'src/auth/decorators/user.decorator';

@Controller('bosses')
export class BossesController {
  constructor(private readonly bossesService: BossesService) {}

  // Коли босів знову будемо робити в оновлені, то розкоментити
  // @Get('boss')
  // getBoss(@UserDec() user: UserPayload) {
  //   return this.bossesService.findBoss(user.id);
  // }

  // @Patch('removePet')
  // removePet(@Query('petId') petId: string, @UserDec() user: UserPayload) {
  //   return this.bossesService.removePetFromBoss(user.id, petId);
  // }

  // @Patch('addPet')
  // addPet(@Query('petId') petId: string, @UserDec() user: UserPayload) {
  //   return this.bossesService.addPetToBoss(user.id, petId);
  // }

  // @Post('finishBoss')
  // finishBoss(@UserDec() user: UserPayload) {
  //   return this.bossesService.finishBoss(user.id);
  // }

  // @Post('startBoss')
  // startBoss(@UserDec() user: UserPayload) {
  //   return this.bossesService.startBoss(user.id);
  // }
}
