import { IsOptional } from 'class-validator';

import { IsStringOrNumber } from 'src/modules/core/validators/is-string-or-number.validator';

export abstract class BaseInputPayload {
  @IsOptional()
  @IsStringOrNumber()
  eventId?: string | number;
}
