import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { sanitize } from 'class-sanitizer';

@Injectable()
export class SanitizeRequestBodyPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata): any {
    if (value && metadata.type === 'body') {
      sanitize(value);
    }

    return value;
  }
}
