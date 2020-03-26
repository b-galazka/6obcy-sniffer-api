import { OutcomingMessage } from '../outcoming-message.enum';
import { IOutcomingMessage } from '../outcoming-message.interface';
import { IMessageOutcomingMessagePayload } from '../payloads/message-outcoming-message-payload.interface';

export class MessageOutcomingMessage implements IOutcomingMessage<IMessageOutcomingMessagePayload> {
  readonly ev_name = OutcomingMessage.message;
  readonly ev_data: IMessageOutcomingMessagePayload;

  constructor(conversationKey: string, message: string) {
    this.ev_data = {
      ckey: conversationKey,
      msg: message,
      idn: 0
    };
  }
}
