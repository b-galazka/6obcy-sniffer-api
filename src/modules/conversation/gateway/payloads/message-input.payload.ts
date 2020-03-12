import { Trim } from 'class-sanitizer';
import { IsArray, IsEnum, IsString, MinLength } from 'class-validator';

import { BaseInputPayload } from '../../../core/websockets-payloads/base-input.payload';
import { Stranger } from '../../services/conversation/stranger.enum';

export class MessageInputPayload extends BaseInputPayload {
  @IsArray()
  @IsEnum(Stranger, { each: true })
  messageReceivers: Stranger[];

  @Trim()
  @IsString()
  @MinLength(1)
  messageContent: string;
}
