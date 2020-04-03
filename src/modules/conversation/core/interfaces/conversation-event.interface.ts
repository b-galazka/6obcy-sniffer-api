import { ConversationEvent } from '../enums/conversation-event.enum';

export interface IConversationEvent<T> {
  readonly event: ConversationEvent;
  readonly data?: T;
}
