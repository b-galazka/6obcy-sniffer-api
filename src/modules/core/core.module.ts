import { Global, Module } from '@nestjs/common';

import { CoreSharedModule } from './shared/core-shared.module';
import { CoreWebSocketsModule } from './websockets/core-websockets.module';

@Global()
@Module({
  imports: [CoreSharedModule, CoreWebSocketsModule],
  exports: [CoreSharedModule, CoreWebSocketsModule]
})
export class CoreModule {}
