import { Module } from '@nestjs/common';

import { ConversationModule } from './modules/conversation/conversation.module';
import { CoreModule } from './modules/core/core.module';

@Module({
  imports: [CoreModule, ConversationModule]
})
export class AppModule {}
