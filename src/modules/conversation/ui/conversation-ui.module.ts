import { Module } from '@nestjs/common';

import { ConversationWebSocketsModule } from './conversation-websockets/conversation-websockets.module';

@Module({
  imports: [ConversationWebSocketsModule]
})
export class ConversationUiModule {}
