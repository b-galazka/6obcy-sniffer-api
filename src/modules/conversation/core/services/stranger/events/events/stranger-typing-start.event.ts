import { StrangerEvent } from '../stranger-event.enum';
import { IStrangerEvent } from '../stranger-event.interface';

export class StrangerTypingStartEvent implements IStrangerEvent<void> {
  readonly event = StrangerEvent.strangerTypingStart;
}
