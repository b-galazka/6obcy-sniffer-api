import { Injectable } from '@nestjs/common';
import { StrangerService } from '../stranger/stranger.service';

// tslint:disable:no-unused-variable
@Injectable()
export class ConversationService {
  constructor(
    private readonly firstStrangerService: StrangerService,
    private readonly secondStrangerService: StrangerService
  ) {}
}
