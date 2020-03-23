import { StrangerEvent } from '../stranger-event.enum';
import { IStrangerEvent } from '../stranger-event.interface';

export class ConversationEndEvent implements IStrangerEvent<void> {
  readonly event = StrangerEvent.conversationEnd;
}
