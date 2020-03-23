import { Injectable } from '@nestjs/common';
import { StrangerService } from '../stranger/stranger.service';

// tslint:disable:no-unused-variable
@Injectable()
export class ConversationService {
  constructor(
    private readonly firstStrangerService: StrangerService,
    private readonly secondStrangerService: StrangerService
  ) {}

  initConnection(): void {
    this.firstStrangerService
      .initConnection()
      .subscribe(console.log, console.log, () => console.log('complete'));
  }
}
