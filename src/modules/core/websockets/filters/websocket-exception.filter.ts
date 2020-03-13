import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { WsResponse } from '@nestjs/websockets';
import WebSocket = require('ws');

import { BaseWebSocketException } from '../exceptions/base-websocket.exception';
import { BaseInputPayload } from '../payloads/base-input.payload';
import { IExceptionOutputPayload } from '../payloads/exception-output.payload';

@Catch()
export class WebSocketExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: Error, host: ArgumentsHost): void {
    const websocketsContext = host.switchToWs();
    const socket: WebSocket = websocketsContext.getClient();
    const eventId = (websocketsContext.getData() as BaseInputPayload)?.eventId;
    const { code, message, stack } = exception as BaseWebSocketException;
    const isKnownException = exception instanceof BaseWebSocketException;

    if (!isKnownException) {
      this.logger.error(message, stack);
    }

    const event: WsResponse<IExceptionOutputPayload> = {
      event: 'exception',
      data: isKnownException
        ? { code, message, eventId }
        : { code: 500, message: 'Internal server error', eventId }
    };

    socket.send(JSON.stringify(event));
  }
}
