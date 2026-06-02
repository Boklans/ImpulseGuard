import { Test, TestingModule } from '@nestjs/testing';
import { BossesController } from './bosses.controller';
import { BossesService } from './bosses.service';

describe('BossesController', () => {
  let controller: BossesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BossesController],
      providers: [BossesService],
    }).compile();

    controller = module.get<BossesController>(BossesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
