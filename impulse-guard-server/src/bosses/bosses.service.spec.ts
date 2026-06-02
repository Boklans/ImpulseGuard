import { Test, TestingModule } from '@nestjs/testing';
import { BossesService } from './bosses.service';

describe('BossesService', () => {
  let service: BossesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BossesService],
    }).compile();

    service = module.get<BossesService>(BossesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
