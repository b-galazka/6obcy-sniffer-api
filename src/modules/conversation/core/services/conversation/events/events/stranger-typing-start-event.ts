import { ConversationEvent } from '../../../../enums/conversation-event.enum';
import { IConversationEvent } from '../../../../interfaces/conversation-event.interface';
import { IStrangerEventPayload } from '../payloads/stranger-event-payload.interface';

export class StrangerTypingStartEvent implements IConversationEvent<IStrangerEventPayload> {
  readonly event = ConversationEvent.strangerTypingStart;
  constructor(readonly data: IStrangerEventPayload) {}
}
