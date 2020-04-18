import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  ServiceUnavailableException
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ForbiddenWebSocketException } from '../../../core';

import {
  ConnectionAlreadyInitializedException,
  ConnectionNotInitializedException,
  ConversationAlreadyStartedException,
  ConversationEventUnion,
  ConversationNotStartedException,
  UnknownConnectionErrorException
} from '../../core';

@Injectable()
export class ConversationExceptionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ConversationEventUnion> {
    return next
      .handle()
      .pipe(catchError(exception => throwError(this.mapExceptionToWebSocketException(exception))));
  }

  private mapExceptionToWebSocketException(exception: Error): Error {
    const forbiddenExceptions = [
      ConnectionNotInitializedException,
      ConnectionAlreadyInitializedException,
      ConversationAlreadyStartedException,
      ConversationNotStartedException
    ];

    const isForbiddenException = forbiddenExceptions.some(
      ForbiddenException => exception instanceof ForbiddenException
    );

    if (isForbiddenException) {
      return new ForbiddenWebSocketException(exception.message);
    }

    const isUnknownConnectionErrorException = exception instanceof UnknownConnectionErrorException;

    if (isUnknownConnectionErrorException) {
      return new ServiceUnavailableException();
    }

    return exception;
  }
}
