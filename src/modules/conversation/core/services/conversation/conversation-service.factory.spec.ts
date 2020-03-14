import { Test, TestingModule } from '@nestjs/testing';

import { createSpyObj } from 'jest-createspyobj';
import { StrangerServiceFactory } from '../stranger/stranger-service.factory';
import { ConversationServiceFactory } from './conversation-service.factory';

describe('ConversationServiceFactory', () => {
  let factory: ConversationServiceFactory;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationServiceFactory,
        {
          provide: StrangerServiceFactory,
          useValue: createSpyObj(StrangerServiceFactory.prototype.constructor)
        }
      ]
    }).compile();

    factory = module.get<ConversationServiceFactory>(ConversationServiceFactory);
  });

  it('should be defined', () => {
    expect(factory).toBeDefined();
  });
});
