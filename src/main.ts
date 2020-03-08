import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';

import { AppModule } from './app.module';
import { AppConfigService } from './modules/core';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  const logger = app.get(Logger);
  const appConfigService = app.get(AppConfigService);

  app.enableCors({ origin: appConfigService.getAllowedDomains() });
  app.useWebSocketAdapter(new WsAdapter());

  await app.listen(appConfigService.getPort(), appConfigService.getIp());

  logger.log(`Application is listening at ${await app.getUrl()}`, 'Bootstrap');
}

bootstrap();
