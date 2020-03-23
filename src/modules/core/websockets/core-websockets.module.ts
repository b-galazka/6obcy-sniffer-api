import { Module } from '@nestjs/common';
import { WebSocketConnectionFactory } from './services/websocket-connection.factory';

@Module({
  providers: [WebSocketConnectionFactory],
  exports: [WebSocketConnectionFactory]
})
export class CoreWebSocketsModule {}
