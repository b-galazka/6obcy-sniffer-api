import { OutcomingMessage } from '../outcoming-message.enum';
import { IOutcomingMessage } from '../outcoming-message.interface';
import { ITypingOutcomingMessagePayload } from '../payloads/typing-outcoming-message-payload.interface';

export class TypingOutcomingMessage implements IOutcomingMessage<ITypingOutcomingMessagePayload> {
  readonly ev_name = OutcomingMessage.typing;
  readonly ev_data: ITypingOutcomingMessagePayload;

  constructor(conversationKey: string, isTyping: boolean) {
    this.ev_data = {
      ckey: conversationKey,
      val: isTyping
    };
  }
}
