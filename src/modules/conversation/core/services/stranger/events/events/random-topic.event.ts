import { IRandomTopicPayload } from '../payloads/random-topic-payload.interface';
import { StrangerEvent } from '../stranger-event.enum';
import { IStrangerEvent } from '../stranger-event.interface';

export class RandomTopicEvent implements IStrangerEvent<IRandomTopicPayload> {
  readonly event = StrangerEvent.randomTopic;
  constructor(readonly data: IRandomTopicPayload) {}
}
