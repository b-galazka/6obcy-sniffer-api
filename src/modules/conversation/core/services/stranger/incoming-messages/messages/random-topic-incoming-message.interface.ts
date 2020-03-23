import { IncomingMessage } from '../incoming-message.enum';
import { IRandomTopicIncomingMessagePayload } from '../payloads/random-topic-incoming-message-payload.interface';

export interface IRandomTopicIncomingMessage {
  ev_name: IncomingMessage.randomTopic;
  ev_data: IRandomTopicIncomingMessagePayload;
}
