import { Module } from '@nestjs/common';

import { ConversationWebSocketsModule } from './websockets';

@Module({
  imports: [ConversationWebSocketsModule]
})
export class ConversationModule {}
