import { Trim } from 'class-sanitizer';
import { IsEnum, IsString, MinLength } from 'class-validator';

import { Stranger } from '../../services/conversation/stranger.enum';

export class MessagePayload {
  @IsEnum(Stranger)
  receiver: Stranger;

  @Trim()
  @IsString()
  @MinLength(1)
  content: string;
}
