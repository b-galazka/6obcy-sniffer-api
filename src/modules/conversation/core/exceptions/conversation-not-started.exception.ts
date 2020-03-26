export class ConversationNotStartedException extends Error {
  constructor() {
    super('Conversation is not started');
  }
}
