import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { AppConfigService, WebSocketAdapter } from './modules/core';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  const logger = app.get(Logger);
  const appConfigService = app.get(AppConfigService);

  app.enableCors({ origin: appConfigService.getAllowedDomains() });
  app.useWebSocketAdapter(new WebSocketAdapter(appConfigService.getWsPort()));

  await app.listen(appConfigService.getPort(), appConfigService.getIp());

  logger.log(`Application is listening at ${await app.getUrl()}`, 'Bootstrap');
}

bootstrap();
