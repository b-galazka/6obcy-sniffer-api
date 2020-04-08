import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { WsResponse } from '@nestjs/websockets';
import WebSocket = require('ws');

import { BaseWebSocketException } from '../exceptions/base-websocket.exception';
import { InternalServerErrorWebSocketException } from '../exceptions/internal-server-error-websocket.exception';
import { IExceptionOutputPayload } from '../payloads/exception-output.payload';

@Catch()
export class WebSocketExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: Error, host: ArgumentsHost): void {
    const websocketsContext = host.switchToWs();
    const socket: WebSocket = websocketsContext.getClient();
    const { message, stack, code } = exception as BaseWebSocketException;

    const event: WsResponse<IExceptionOutputPayload> = {
      event: 'exception',
      data: this.getExceptionOutputPayload(exception)
    };

    if (!code) {
      this.logger.error(message, stack);
    }

    socket.send(JSON.stringify(event));
  }

  private getExceptionOutputPayload(exception: Error): IExceptionOutputPayload {
    const { code, message } =
      exception instanceof BaseWebSocketException
        ? exception
        : new InternalServerErrorWebSocketException();

    return { code, message };
  }
}
