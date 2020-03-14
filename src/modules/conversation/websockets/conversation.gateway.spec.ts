import { Test, TestingModule } from '@nestjs/testing';
import { createSpyObj } from 'jest-createspyobj';

import { ConversationServiceFactory } from '../core';
import { ConversationGateway } from './conversation.gateway';

jest.mock('fs', () => ({ readFileSync: () => ({}) }));

describe('ConversationGateway', () => {
  let gateway: ConversationGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationGateway,
        {
          provide: ConversationServiceFactory,
          useValue: createSpyObj(ConversationServiceFactory.prototype.constructor)
        }
      ]
    }).compile();

    gateway = module.get<ConversationGateway>(ConversationGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
