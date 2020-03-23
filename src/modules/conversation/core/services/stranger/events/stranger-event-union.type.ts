import { ConversationEndEvent } from './events/conversation-end.event';
import { ConversationStartEvent } from './events/conversation-start.event';
import { InitializationSuccessEvent } from './events/initialization-success.event';
import { ProhibitedMessageEvent } from './events/prohibited-message.event';
import { RandomTopicEvent } from './events/random-topic.event';
import { StrangerMessageEvent } from './events/stranger-message.event';
import { StrangerTypingStartEvent } from './events/stranger-typing-start.event';
import { StrangerTypingStopEvent } from './events/stranger-typing-stop.event';
import { UsersCountEvent } from './events/users-count.event';

export type StrangerEventUnion =
  | ConversationEndEvent
  | ConversationStartEvent
  | ProhibitedMessageEvent
  | RandomTopicEvent
  | StrangerMessageEvent
  | StrangerTypingStartEvent
  | StrangerTypingStopEvent
  | UsersCountEvent
  | InitializationSuccessEvent;
