import { StrangerEvent } from '../stranger-event.enum';
import { IStrangerEvent } from '../stranger-event.interface';

export class StrangerTypingStopEvent implements IStrangerEvent<void> {
  readonly event = StrangerEvent.strangerTypingStop;
}
