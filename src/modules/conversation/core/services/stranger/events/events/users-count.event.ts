import { IUsersCountPayload } from '../payloads/users-count-payload.interface';
import { StrangerEvent } from '../stranger-event.enum';
import { IStrangerEvent } from '../stranger-event.interface';

export class UsersCountEvent implements IStrangerEvent<IUsersCountPayload> {
  readonly event = StrangerEvent.usersCount;
  constructor(readonly data: IUsersCountPayload) {}
}
