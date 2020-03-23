import { Injectable, Logger } from '@nestjs/common';

import { AppConfigService, IServiceFactory, WebSocketConnectionFactory } from '../../../../core';
import { StrangerService } from './stranger.service';

@Injectable()
export class StrangerServiceFactory implements IServiceFactory<StrangerService> {
  constructor(
    private readonly webSocketConnectionFactory: WebSocketConnectionFactory,
    private readonly appConfigService: AppConfigService,
    private readonly logger: Logger
  ) {}

  constructService(): StrangerService {
    return new StrangerService(this.webSocketConnectionFactory, this.logger, this.appConfigService);
  }
}
