import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppConfigService } from './services/app-config.service';

@Module({
  imports: [ConfigModule.forRoot()],
  providers: [Logger, AppConfigService]
})
export class CoreModule {}
