import { ConversationEvent } from '../../../../enums/conversation-event.enum';
import { IConversationEvent } from '../../../../interfaces/conversation-event.interface';
import { IStrangerEventPayload } from '../payloads/stranger-event-payload.interface';

export class StrangerTypingStopEvent implements IConversationEvent<IStrangerEventPayload> {
  readonly event = ConversationEvent.strangerTypingStop;
  constructor(readonly data: IStrangerEventPayload) {}
}
