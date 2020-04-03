import { ConversationEvent } from '../../../../enums/conversation-event.enum';
import { IConversationEvent } from '../../../../interfaces/conversation-event.interface';

export class ConversationEndStrangerEvent implements IConversationEvent<void> {
  readonly event = ConversationEvent.conversationEnd;
}
