import { Injectable } from '@nestjs/common';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import WebSocket = require('ws');

@Injectable()
export class WebSocketConnectionFactory {
  constructWebSocketConnection(url: string): WebSocketSubject<string> {
    return webSocket({
      url,
      deserializer: event => event.data,
      serializer: payload => payload,
      // TODO: fix typing
      WebSocketCtor: WebSocket as any
    });
  }
}
