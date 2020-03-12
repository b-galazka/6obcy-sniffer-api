import { ArgumentMetadata, BadRequestException, Injectable, ValidationPipe } from '@nestjs/common';

import { BadRequestWebSocketException } from '../exceptions/bad-request-websocket.exception';

@Injectable()
export class WebSocketValidationPipe extends ValidationPipe {
  async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
    try {
      return await super.transform(value, metadata);
    } catch (err) {
      const { message }: BadRequestException = err;

      throw new BadRequestWebSocketException(message.message);
    }
  }
}
