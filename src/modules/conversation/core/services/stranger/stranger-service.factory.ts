import { Injectable } from '@nestjs/common';

import { IServiceFactory } from '../../../../core';
import { StrangerService } from './stranger.service';

@Injectable()
export class StrangerServiceFactory implements IServiceFactory<StrangerService> {
  constructService(): StrangerService {
    return new StrangerService();
  }
}
