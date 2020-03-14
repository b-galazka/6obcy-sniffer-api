import { Test, TestingModule } from '@nestjs/testing';
import { StrangerServiceFactory } from './stranger-service.factory';

describe('StrangerServiceFactory', () => {
  let service: StrangerServiceFactory;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StrangerServiceFactory]
    }).compile();

    service = module.get<StrangerServiceFactory>(StrangerServiceFactory);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
