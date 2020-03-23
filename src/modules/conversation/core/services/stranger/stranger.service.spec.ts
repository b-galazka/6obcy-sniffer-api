import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createSpyObj } from 'jest-createspyobj';

import { AppConfigService, WebSocketConnectionFactory } from '../../../../core';
import { StrangerService } from './stranger.service';

describe('StrangerService', () => {
  let service: StrangerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StrangerService,
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

    service = module.get<StrangerService>(StrangerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
