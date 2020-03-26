import { ConversationEndOutcomingMessage } from './messages/conversation-end-outcoming-message';
import { ConversationStartOutcomingMessage } from './messages/conversation-start-outcoming-message';
import { MessageOutcomingMessage } from './messages/message-outcoming-message';
import { TypingOutcomingMessage } from './messages/typing-outcoming-message';

export type OutcomingMessageUnion =
  | ConversationEndOutcomingMessage
  | ConversationStartOutcomingMessage
  | MessageOutcomingMessage
  | TypingOutcomingMessage;
