import { ConversationEvent } from '../../../../enums/conversation-event.enum';
import { IConversationEvent } from '../../../../interfaces/conversation-event.interface';
import { IRandomTopicEventPayload } from '../payloads/random-topic-event-payload.interface';

export class RandomTopicEvent implements IConversationEvent<IRandomTopicEventPayload> {
  readonly event = ConversationEvent.randomTopic;
  constructor(readonly data: IRandomTopicEventPayload) {}
}
