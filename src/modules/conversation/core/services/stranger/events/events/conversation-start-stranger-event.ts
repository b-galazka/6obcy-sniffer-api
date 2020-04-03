import { ConversationEvent } from '../../../../enums/conversation-event.enum';
import { IConversationEvent } from '../../../../interfaces/conversation-event.interface';

export class ConversationStartStrangerEvent implements IConversationEvent<void> {
  readonly event = ConversationEvent.conversationStart;
}
