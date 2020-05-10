import { Injectable } from '@nestjs/common';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import WebSocket = require('ws');

@Injectable()
export class WebSocketConnectionFactory {
  constructWebSocketConnection(wsUrl: string, wsOriginUrl: string = ''): WebSocketSubject<string> {
    return webSocket({
      url: wsUrl,
      deserializer: event => event.data,
      serializer: payload => payload,
      // ugly workaround to provide origin (not supported by rxjs webSocket by default)
      WebSocketCtor: class extends WebSocket {
        constructor(url: string, protocols?: string | string[]) {
          super(url, protocols, { origin: wsOriginUrl });
        }
      } as any
    });
  }
}
