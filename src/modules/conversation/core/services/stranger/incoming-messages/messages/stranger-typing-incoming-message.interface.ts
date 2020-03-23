import { IncomingMessage } from '../incoming-message.enum';

export interface IStrangerTypingIncomingMessage {
  ev_name: IncomingMessage.strangerTyping;
  ev_data: boolean;
}
