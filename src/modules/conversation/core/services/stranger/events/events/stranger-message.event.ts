import { IStrangerMessagePayload } from '../payloads/stranger-message-payload.interface';
import { StrangerEvent } from '../stranger-event.enum';
import { IStrangerEvent } from '../stranger-event.interface';

export class StrangerMessageEvent implements IStrangerEvent<IStrangerMessagePayload> {
  readonly event = StrangerEvent.strangerMessage;
  constructor(readonly data: IStrangerMessagePayload) {}
}
