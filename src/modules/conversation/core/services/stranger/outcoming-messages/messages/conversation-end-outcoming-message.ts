import { OutcomingMessage } from '../outcoming-message.enum';
import { IOutcomingMessage } from '../outcoming-message.interface';
import { IConversationEndOutcomingMessagePayload } from '../payloads/conversation-end-outcoming-message-payload.interface';

export class ConversationEndOutcomingMessage
  implements IOutcomingMessage<IConversationEndOutcomingMessagePayload> {
  readonly ev_name = OutcomingMessage.conversationEnd;
  readonly ev_data: IConversationEndOutcomingMessagePayload;

  constructor(conversationKey: string) {
    this.ev_data = { ckey: conversationKey };
  }
}
