export interface IStrangerInformations {
  sex: number;
  loc: number;
}

export interface IConversationStartOutcomingMessagePayload {
  channel: string;
  myself: IStrangerInformations;
  preferences: IStrangerInformations;
}
