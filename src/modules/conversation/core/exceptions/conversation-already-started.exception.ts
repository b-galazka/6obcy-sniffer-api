export class ConversationAlreadyStartedException extends Error {
  constructor() {
    super('Conversation is already started');
  }
}
