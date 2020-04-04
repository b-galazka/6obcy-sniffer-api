import { ConversationEvent } from '../../../../enums/conversation-event.enum';
import { IConversationEvent } from '../../../../interfaces/conversation-event.interface';

export class ConnectionInitSuccessStrangerEvent implements IConversationEvent<void> {
  readonly event = ConversationEvent.connectionInitSuccess;
  readonly data: void;
}
