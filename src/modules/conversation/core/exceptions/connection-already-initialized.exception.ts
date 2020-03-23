export class ConnectionAlreadyInitializedException extends Error {
  constructor() {
    super('Connection is already initialized');
  }
}
