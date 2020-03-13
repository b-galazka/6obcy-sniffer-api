import { Module } from '@nestjs/common';

import { CoreSharedModule } from './shared/core-shared.module';
import { CoreWebSocketsModule } from './websockets/core-websockets.module';

@Module({
  imports: [CoreSharedModule, CoreWebSocketsModule]
})
export class CoreModule {}
