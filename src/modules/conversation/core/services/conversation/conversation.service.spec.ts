import { createSpyObj } from 'jest-createspyobj';

import { StrangerService } from '../stranger/stranger.service';
import { ConversationService } from './conversation.service';

describe('ConversationService', () => {
  let service: ConversationService;

  beforeEach(() => {
    service = new ConversationService(
      createSpyObj(StrangerService.prototype.constructor),
      createSpyObj(StrangerService.prototype.constructor)
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
