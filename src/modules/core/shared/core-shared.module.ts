import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';

import { SanitizeRequestBodyPipe } from './pipes/sanitize-request-body.pipe';
import { AppConfigService } from './services/app-config.service';

@Module({
  imports: [ConfigModule.forRoot()],
  providers: [Logger, AppConfigService, { provide: APP_PIPE, useClass: SanitizeRequestBodyPipe }]
})
export class CoreSharedModule {}
