import { ArgumentMetadata, BadRequestException, Injectable, ValidationPipe } from '@nestjs/common';
import { IBadRequestExceptionResponose } from '../../shared/interfaces/bad-request-exception-response.interface';

import { BadRequestWebSocketException } from '../exceptions/bad-request-websocket.exception';

@Injectable()
export class WebSocketValidationPipe extends ValidationPipe {
  async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
    try {
      return await super.transform(value, metadata);
    } catch (err) {
      const {
        message
      } = (err as BadRequestException).getResponse() as IBadRequestExceptionResponose;

      throw new BadRequestWebSocketException(message.join('; '));
    }
  }
}
