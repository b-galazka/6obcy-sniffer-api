import { ConversationEvent } from '../../../../enums/conversation-event.enum';
import { IConversationEvent } from '../../../../interfaces/conversation-event.interface';
import { IProhibitedMessageStrangerEventPayload } from '../payloads/prohibited-message-stranger-event-payload.interface';

export class ProhibitedMessageStrangerEvent
  implements IConversationEvent<IProhibitedMessageStrangerEventPayload> {
  readonly event = ConversationEvent.prohibitedMessage;
  constructor(readonly data: IProhibitedMessageStrangerEventPayload) {}
}
