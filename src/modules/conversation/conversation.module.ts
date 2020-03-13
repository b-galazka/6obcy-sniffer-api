import { Module } from '@nestjs/common';

import { ConversationCoreModule } from './core';
import { ConversationUiModule } from './ui';

@Module({
  imports: [ConversationCoreModule, ConversationUiModule]
})
export class ConversationModule {}
