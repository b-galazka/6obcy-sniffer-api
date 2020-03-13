import { WsException } from '@nestjs/websockets';

export abstract class BaseWebSocketException extends WsException {
  constructor(error: string | object, readonly code: number) {
    super(error);
  }
}
