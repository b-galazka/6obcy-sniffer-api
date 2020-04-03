import { ConnectionInitSuccessStrangerEvent } from './events/connection-init-success-stranger-event';
import { ConversationEndStrangerEvent } from './events/conversation-end-stranger-event';
import { ConversationStartStrangerEvent } from './events/conversation-start-stranger-event';
import { ProhibitedMessageStrangerEvent } from './events/prohibited-message-stranger-event';
import { RandomTopicStrangerEvent } from './events/random-topic-stranger-event';
import { StrangerMessageStrangerEvent } from './events/stranger-message-stranger-event';
import { StrangerTypingStartStrangerEvent } from './events/stranger-typing-start-stranger-event';
import { StrangerTypingStopStrangerEvent } from './events/stranger-typing-stop-stranger-event';
import { UsersCountStrangerEvent } from './events/users-count-stranger-event';

export type StrangerEventUnion =
  | ConversationEndStrangerEvent
  | ConversationStartStrangerEvent
  | ProhibitedMessageStrangerEvent
  | RandomTopicStrangerEvent
  | StrangerMessageStrangerEvent
  | StrangerTypingStartStrangerEvent
  | StrangerTypingStopStrangerEvent
  | UsersCountStrangerEvent
  | ConnectionInitSuccessStrangerEvent;
