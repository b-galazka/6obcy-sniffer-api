import { ConversationEvent } from '../../../../enums/conversation-event.enum';
import { IConversationEvent } from '../../../../interfaces/conversation-event.interface';
import { IRandomTopicStrangerEventPayload } from '../payloads/random-topic-stranger-event-payload.interface';

export class RandomTopicStrangerEvent
  implements IConversationEvent<IRandomTopicStrangerEventPayload>
{
  readonly event = ConversationEvent.randomTopic;
  constructor(readonly data: IRandomTopicStrangerEventPayload) {}
}
