import { IRandomTopicStrangerEventPayload } from '../../../stranger/events/payloads/random-topic-stranger-event-payload.interface';
import { IStrangerEventPayload } from './stranger-event-payload.interface';

export interface IRandomTopicEventPayload
  extends IRandomTopicStrangerEventPayload,
    IStrangerEventPayload {}
