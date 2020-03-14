import { Module } from '@nestjs/common';

import { ConversationCoreModule } from '../core';
import { ConversationGateway } from './conversation.gateway';

@Module({
  imports: [ConversationCoreModule],
  providers: [ConversationGateway]
})
export class ConversationWebSocketsModule {}
