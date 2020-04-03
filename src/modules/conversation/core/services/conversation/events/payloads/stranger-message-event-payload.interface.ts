import { IStrangerMessageStrangerEventPayload } from '../../../stranger/events/payloads/stranger-message-stranger-event-payload.interface';
import { IStrangerEventPayload } from './stranger-event-payload.interface';

export interface IStrangerMessageEventPayload
  extends IStrangerMessageStrangerEventPayload,
    IStrangerEventPayload {}
