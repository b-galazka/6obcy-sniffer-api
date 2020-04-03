import { ConversationEvent } from '../../../../enums/conversation-event.enum';
import { IConversationEvent } from '../../../../interfaces/conversation-event.interface';
import { IUsersCountStrangerEventPayload } from '../payloads/users-count-stranger-event-payload.interface';

export class UsersCountStrangerEvent
  implements IConversationEvent<IUsersCountStrangerEventPayload> {
  readonly event = ConversationEvent.usersCount;
  constructor(readonly data: IUsersCountStrangerEventPayload) {}
}
