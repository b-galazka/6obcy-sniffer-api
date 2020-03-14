import { Module } from '@nestjs/common';

import { ConversationServiceFactory } from './services/conversation/conversation-service.factory';
import { StrangerServiceFactory } from './services/stranger/stranger-service.factory';

@Module({
  providers: [ConversationServiceFactory, StrangerServiceFactory],
  exports: [ConversationServiceFactory]
})
export class ConversationCoreModule {}
