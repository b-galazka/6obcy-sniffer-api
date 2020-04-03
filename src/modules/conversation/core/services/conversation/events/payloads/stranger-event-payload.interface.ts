import { Stranger } from '../../../../enums/stranger.enum';

export interface IStrangerEventPayload {
  doer: Stranger | null;
}
