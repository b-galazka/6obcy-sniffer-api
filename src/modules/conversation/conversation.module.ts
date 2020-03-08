import { Module } from '@nestjs/common';

import { ConversationGateway } from './gateway/conversation.gateway';
import { ConversationService } from './services/conversation/conversation.service';

@Module({
  providers: [ConversationGateway, ConversationService]
})
export class ConversationModule {}
