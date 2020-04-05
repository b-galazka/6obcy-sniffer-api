import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import {
  BaseWebSocketException,
  ForbiddenWebSocketException,
  InternalServerErrorWebSocketException
} from '../../../core';

import {
  ConnectionAlreadyInitializedException,
  ConnectionNotInitializedException,
  ConversationAlreadyStartedException,
  ConversationEventUnion,
  ConversationNotStartedException
} from '../../core';

@Injectable()
export class ConversationExceptionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ConversationEventUnion> {
    return next
      .handle()
      .pipe(catchError(exception => throwError(this.mapExceptionToWebSocketException(exception))));
  }

  private mapExceptionToWebSocketException(exception: Error): BaseWebSocketException {
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

    return new InternalServerErrorWebSocketException();
  }
}
