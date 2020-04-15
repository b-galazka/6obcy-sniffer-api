import { Trim } from 'class-sanitizer';
import { ArrayUnique, IsArray, IsEnum, IsString, MinLength } from 'class-validator';

import { Stranger } from '../../core';

export class MessageInputPayload {
  @IsArray()
  @IsEnum(Stranger, { each: true })
  @ArrayUnique()
  messageReceivers: Stranger[];

  @Trim()
  @IsString()
  @MinLength(1)
  messageContent: string;
}
