import { ConversationEvent } from '../../../../enums/conversation-event.enum';
import { IConversationEvent } from '../../../../interfaces/conversation-event.interface';
import { IStrangerEventPayload } from '../payloads/stranger-event-payload.interface';

export class ConversationEndEvent implements IConversationEvent<IStrangerEventPayload> {
  readonly event = ConversationEvent.conversationEnd;
  constructor(readonly data: IStrangerEventPayload) {}
}
