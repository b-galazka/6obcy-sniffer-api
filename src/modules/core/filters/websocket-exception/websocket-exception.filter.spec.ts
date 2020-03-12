import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createSpyObj } from 'jest-createspyobj';
import { WebSocketExceptionFilter } from './websocket-exception.filter';

describe('WebSocketExceptionFilter', () => {
  let webSocketExceptionFilter: WebSocketExceptionFilter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebSocketExceptionFilter,
        { provide: Logger, useValue: createSpyObj(Logger.constructor) }
      ]
    }).compile();

    webSocketExceptionFilter = module.get<WebSocketExceptionFilter>(WebSocketExceptionFilter);
  });

  it('should be defined', () => {
    expect(webSocketExceptionFilter).toBeDefined();
  });
});
