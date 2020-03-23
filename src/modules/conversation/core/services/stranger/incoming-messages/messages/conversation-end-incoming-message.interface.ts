import { IncomingMessage } from '../incoming-message.enum';

export interface IConversationEndIncomingMessage {
  ev_name: IncomingMessage.conversationEnd;
}
