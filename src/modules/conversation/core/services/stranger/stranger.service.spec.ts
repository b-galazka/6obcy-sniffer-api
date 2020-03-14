import { Test, TestingModule } from '@nestjs/testing';

import { StrangerService } from './stranger.service';

describe('StrangerService', () => {
  let service: StrangerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StrangerService]
    }).compile();

    service = module.get<StrangerService>(StrangerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
