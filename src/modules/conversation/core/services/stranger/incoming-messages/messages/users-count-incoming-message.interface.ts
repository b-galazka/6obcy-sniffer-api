import { IncomingMessage } from '../incoming-message.enum';

export interface IUsersCountIncomingMessage {
  ev_name: IncomingMessage.usersCount;
  ev_data: number;
}
