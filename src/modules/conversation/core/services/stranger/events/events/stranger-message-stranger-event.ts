import { ConversationEvent } from '../../../../enums/conversation-event.enum';
import { IConversationEvent } from '../../../../interfaces/conversation-event.interface';
import { IStrangerMessageStrangerEventPayload } from '../payloads/stranger-message-stranger-event-payload.interface';

export class StrangerMessageStrangerEvent
  implements IConversationEvent<IStrangerMessageStrangerEventPayload>
{
  readonly event = ConversationEvent.strangerMessage;
  constructor(readonly data: IStrangerMessageStrangerEventPayload) {}
}
