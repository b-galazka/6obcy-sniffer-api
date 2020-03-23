import { IncomingMessage } from '../incoming-message.enum';
import { IStrangerMessageIncomingMessagePayload } from '../payloads/stranger-message-incoming-message-payload.interface';

export interface IStrangerMessageIncomingMessage {
  ev_name: IncomingMessage.strangerMessage;
  ev_data: IStrangerMessageIncomingMessagePayload;
}
