import { OutcomingMessage } from './outcoming-message.enum';

export interface IOutcomingMessage<T> {
  ev_name: OutcomingMessage;
  ev_data: T;
}
