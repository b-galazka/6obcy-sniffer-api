import { IsOptional } from 'class-validator';

import { IsStringOrNumber } from '../../../core';

export abstract class BaseInputPayload {
  @IsOptional()
  @IsStringOrNumber()
  eventId?: string | number;
}
