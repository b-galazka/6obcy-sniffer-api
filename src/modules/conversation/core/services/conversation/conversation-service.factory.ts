import { Injectable } from '@nestjs/common';

import { IServiceFactory } from '../../../../core';
import { StrangerServiceFactory } from '../stranger/stranger-service.factory';
import { ConversationService } from './conversation.service';

@Injectable()
export class ConversationServiceFactory implements IServiceFactory<ConversationService> {
  constructor(private readonly strangerServiceFactory: StrangerServiceFactory) {}

  constructService(): ConversationService {
    return new ConversationService(
      this.strangerServiceFactory.constructService(),
      this.strangerServiceFactory.constructService()
    );
  }
}
