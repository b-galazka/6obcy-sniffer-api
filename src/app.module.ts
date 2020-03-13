import { Module } from '@nestjs/common';

import { ConversationModule } from './modules/conversation';
import { CoreModule } from './modules/core';

@Module({
  imports: [CoreModule, ConversationModule]
})
export class AppModule {}
