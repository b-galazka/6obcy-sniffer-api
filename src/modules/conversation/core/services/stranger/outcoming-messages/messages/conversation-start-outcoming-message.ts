import { OutcomingMessage } from '../outcoming-message.enum';
import { IOutcomingMessage } from '../outcoming-message.interface';
import { IConversationStartOutcomingMessagePayload } from '../payloads/conversation-start-outcoming-message-payload.interface';

export class ConversationStartOutcomingMessage
  implements IOutcomingMessage<IConversationStartOutcomingMessagePayload> {
  readonly ev_name = OutcomingMessage.conversationStart;

  readonly ev_data = {
    channel: 'main',
    myself: {
      sex: 0,
      loc: 0
    },
    preferences: {
      sex: 0,
      loc: 0
    }
  };
}
