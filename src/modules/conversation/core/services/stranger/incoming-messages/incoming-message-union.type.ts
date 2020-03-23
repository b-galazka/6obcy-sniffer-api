import { IConversationEndIncomingMessage } from './messages/conversation-end-incoming-message.interface';
import { IConversationStartIncomingMessage } from './messages/conversation-start-incoming-message.interface';
import { IProhibitedMessageIncomingMessage } from './messages/prohibited-message-incoming-message.interface';
import { IRandomTopicIncomingMessage } from './messages/random-topic-incoming-message.interface';
import { IStrangerMessageIncomingMessage } from './messages/stranger-message-incoming-message.interface';
import { IStrangerTypingIncomingMessage } from './messages/stranger-typing-incoming-message.interface';
import { IUsersCountIncomingMessage } from './messages/users-count-incoming-message.interface';

export type IncomingMessageUnion =
  | IConversationStartIncomingMessage
  | IConversationEndIncomingMessage
  | IProhibitedMessageIncomingMessage
  | IRandomTopicIncomingMessage
  | IStrangerMessageIncomingMessage
  | IStrangerTypingIncomingMessage
  | IUsersCountIncomingMessage;
