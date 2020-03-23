export class ConnectionNotInitializedException extends Error {
  constructor() {
    super('Connection is not initialized');
  }
}
