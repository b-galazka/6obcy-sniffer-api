import { BaseWebSocketException } from './base-websocket.exception';

export class SeriviceUnavailableWebSocketException extends BaseWebSocketException {
  constructor(error: string | object = 'Service unavailable') {
    super(error, 503);
  }
}
