import { BaseWebSocketException } from './base-websocket.exception';

export class InternalServerErrorWebSocketException extends BaseWebSocketException {
  constructor(error: string | object = 'Internal server error') {
    super(error, 500);
  }
}
