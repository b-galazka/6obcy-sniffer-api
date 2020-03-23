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

    const event: WsResponse<IExceptionOutputPayload> = {
      event: 'exception',
      data:
        exception instanceof BaseWebSocketException
          ? { code, message, eventId }
          : { code: 500, message: 'Internal server error', eventId }
    };

    if (event.data.code === 500) {
      this.logger.error(message, stack);
    }

    socket.send(JSON.stringify(event));
  }
}
