import { ConversationEvent } from '../../../../enums/conversation-event.enum';
import { IConversationEvent } from '../../../../interfaces/conversation-event.interface';

export class StrangerTypingStartStrangerEvent implements IConversationEvent<void> {
  readonly event = ConversationEvent.strangerTypingStart;
}
