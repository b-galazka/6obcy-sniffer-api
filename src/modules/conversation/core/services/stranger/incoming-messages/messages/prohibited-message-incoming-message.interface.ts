import { IncomingMessage } from '../incoming-message.enum';
import { IProhibitedMessageIncomingMessagePayload } from '../payloads/prohibited-message-incoming-message-payload.interface';

export interface IProhibitedMessageIncomingMessage {
  ev_name: IncomingMessage.prohibitedMessage;
  ev_data: IProhibitedMessageIncomingMessagePayload;
}
