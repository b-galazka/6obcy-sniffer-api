import { StrangerEvent } from './stranger-event.enum';

export interface IStrangerEvent<T> {
  readonly event: StrangerEvent;
  readonly data?: T;
}
