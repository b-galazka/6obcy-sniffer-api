import { IProhibitedMessagePayload } from '../payloads/prohibited-message-payload.interface';
import { StrangerEvent } from '../stranger-event.enum';
import { IStrangerEvent } from '../stranger-event.interface';

export class ProhibitedMessageEvent implements IStrangerEvent<IProhibitedMessagePayload> {
  readonly event = StrangerEvent.prohibitedMessage;
  constructor(readonly data: IProhibitedMessagePayload) {}
}
