import { Test, TestingModule } from '@nestjs/testing';
import { WebSocketConnectionFactory } from './websocket-connection.factory';

describe('WebSocketConnectionFactory', () => {
  let service: WebSocketConnectionFactory;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WebSocketConnectionFactory]
    }).compile();

    service = module.get<WebSocketConnectionFactory>(WebSocketConnectionFactory);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
