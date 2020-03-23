import { StrangerEvent } from '../stranger-event.enum';
import { IStrangerEvent } from '../stranger-event.interface';

export class ConversationStartEvent implements IStrangerEvent<void> {
  readonly event = StrangerEvent.conversationStart;
}
