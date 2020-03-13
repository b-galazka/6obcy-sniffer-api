import { BaseWebSocketException } from './base-websocket.exception';

export class BadRequestWebSocketException extends BaseWebSocketException {
  constructor(error: string | object = 'Bad request') {
    super(error, 400);
  }
}
