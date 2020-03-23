import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createSpyObj } from 'jest-createspyobj';

import { AppConfigService, WebSocketConnectionFactory } from '../../../../core';
import { StrangerServiceFactory } from './stranger-service.factory';

describe('StrangerServiceFactory', () => {
  let service: StrangerServiceFactory;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StrangerServiceFactory,
        {
          provide: WebSocketConnectionFactory,
          useValue: createSpyObj(WebSocketConnectionFactory.prototype.constructor)
        },
        {
          provide: AppConfigService,
          useValue: createSpyObj(AppConfigService.prototype.constructor)
        },
        {
          provide: Logger,
          useValue: createSpyObj(Logger.prototype.constructor)
        }
      ]
    }).compile();

    service = module.get<StrangerServiceFactory>(StrangerServiceFactory);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
