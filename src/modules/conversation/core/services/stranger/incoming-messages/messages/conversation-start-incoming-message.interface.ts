import { IncomingMessage } from '../incoming-message.enum';
import { IConversationStartIncomingMessagePayload } from '../payloads/conversation-start-incoming-message-payload.interface';

export interface IConversationStartIncomingMessage {
  ev_name: IncomingMessage.conversationStart;
  ev_data: IConversationStartIncomingMessagePayload;
}
