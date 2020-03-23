import { StrangerEvent } from '../stranger-event.enum';
import { IStrangerEvent } from '../stranger-event.interface';

export class InitializationSuccessEvent implements IStrangerEvent<void> {
  readonly event = StrangerEvent.initializationSuccess;
}
