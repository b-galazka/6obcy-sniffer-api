import { ConversationEvent } from '../../../../enums/conversation-event.enum';
import { IConversationEvent } from '../../../../interfaces/conversation-event.interface';
import { IStrangerMessageEventPayload } from '../payloads/stranger-message-event-payload.interface';

export class StrangerMessageEvent implements IConversationEvent<IStrangerMessageEventPayload> {
  readonly event = ConversationEvent.strangerMessage;
  constructor(readonly data: IStrangerMessageEventPayload) {}
}
