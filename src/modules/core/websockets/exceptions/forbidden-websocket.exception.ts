import { BaseWebSocketException } from './base-websocket.exception';

export class ForbiddenWebSocketException extends BaseWebSocketException {
  constructor(error: string | object = 'Forbidden') {
    super(error, 403);
  }
}
