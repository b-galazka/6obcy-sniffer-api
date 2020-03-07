import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { AppConfigService } from './modules/core';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  const logger = app.get(Logger);
  const appConfigService = app.get(AppConfigService);

  app.enableCors({ origin: appConfigService.getAllowedDomains() });

  const port = appConfigService.getPort();
  const ip = appConfigService.getIp();

  await app.listen(port, ip);

  logger.log(`Application is listening at ${ip}:${port}`, 'Bootstraping');
}

bootstrap();
