import {
  catchError,
  filter,
  map,
  mapTo,
  mergeMap,
  skip,
  switchMap,
  switchMapTo,
  take,
  tap,
  timeout
} from 'rxjs/operators';

import { Injectable, Logger } from '@nestjs/common';
import { concat, interval, merge, Observable, of, throwError } from 'rxjs';
import { WebSocketSubject } from 'rxjs/webSocket';

import { AppConfigService, WebSocketConnectionFactory } from '../../../../core';
import { ConnectionAlreadyInitializedException } from '../../exceptions/connection-already-initialized.exception';
import { ConnectionNotInitializedException } from '../../exceptions/connection-not-initialized.exception';
import { UnknownConnectionError } from '../../exceptions/unknown-connection-error.exception';
import { ConversationEndEvent } from './events/events/conversation-end.event';
import { ConversationStartEvent } from './events/events/conversation-start.event';
import { InitializationSuccessEvent } from './events/events/initialization-success.event';
import { ProhibitedMessageEvent } from './events/events/prohibited-message.event';
import { RandomTopicEvent } from './events/events/random-topic.event';
import { StrangerMessageEvent } from './events/events/stranger-message.event';
import { StrangerTypingStartEvent } from './events/events/stranger-typing-start.event';
import { StrangerTypingStopEvent } from './events/events/stranger-typing-stop.event';
import { UsersCountEvent } from './events/events/users-count.event';
import { StrangerEventUnion } from './events/stranger-event-union.type';
import { IncomingMessageUnion } from './incoming-messages/incoming-message-union.type';
import { IncomingMessage } from './incoming-messages/incoming-message.enum';
import { IInitialIncomingMessage } from './incoming-messages/messages/initial-incoming-message.interface';

// TODO: rename events from StrangerMessageEvent to StrangerMessageStrangerEvent etc?
// TODO: rename incoming messages from RandomTopicIncomingMessage to RandomTopicIncomingStrangerMessage etc?

@Injectable()
export class StrangerService {
  private webSocket$: WebSocketSubject<string> | null;
  private webSocketMessages$: Observable<object | string> | null;
  private isConnectionDestroyedByClient = false;

  constructor(
    private readonly webSocketConnectionFactory: WebSocketConnectionFactory,
    private readonly logger: Logger,
    private readonly appConfigService: AppConfigService
  ) {}

  get isConnectionInitialized(): boolean {
    return !!this.webSocket$;
  }

  initConnection(): Observable<StrangerEventUnion | void> {
    if (this.isConnectionInitialized) {
      throw new ConnectionAlreadyInitializedException();
    }

    this.isConnectionDestroyedByClient = false;

    this.webSocket$ = this.webSocketConnectionFactory.constructWebSocketConnection(
      this.appConfigService.getWsApiUrl()
    );

    this.webSocketMessages$ = this.webSocket$.pipe(
      map(message => this.parseIncomingSocketMessage(message))
    );

    return concat(this.initWebSocketMessagesHandling(), this.initConnectionDestroyHandling());
  }

  private parseIncomingSocketMessage(message: string): object | string {
    try {
      const parsedMessage = JSON.parse(message.slice(message.indexOf('{')));

      return typeof parsedMessage === 'object' ? parsedMessage : message;
    } catch (err) {
      return message;
    }
  }

  private initWebSocketMessagesHandling(): Observable<StrangerEventUnion | void> {
    return merge(
      this.initInitialIncomingMessageHandling(),
      this.initIncomingMessagesMapping()
    ).pipe(catchError(error => this.handleConnectionError(error)));
  }

  private initInitialIncomingMessageHandling(): Observable<InitializationSuccessEvent | void> {
    return merge(this.initInitialIncomingMessageMapping(), this.initHeartbeat());
  }

  private initInitialIncomingMessageMapping(): Observable<InitializationSuccessEvent> {
    return this.webSocketMessages$!.pipe(
      take(1),
      map(() => this.mapInitialIncomingMessage())
    );
  }

  private mapInitialIncomingMessage(): InitializationSuccessEvent {
    return new InitializationSuccessEvent();
  }

  private initHeartbeat(): Observable<void> {
    return this.webSocketMessages$!.pipe(
      take(1),
      switchMap(({ pingInterval, pingTimeout }: IInitialIncomingMessage) =>
        this.initPingInterval(pingInterval, pingTimeout)
      ),
      filter(() => false)
    ) as Observable<void>;
  }

  private initPingInterval(pingInterval: number, pingTimeout: number): Observable<void> {
    return interval(pingInterval).pipe(mergeMap(() => this.ping().pipe(timeout(pingTimeout))));
  }

  private ping(): Observable<void> {
    this.webSocket$!.next('2');

    return this.webSocketMessages$!.pipe(
      filter(message => this.filterPongMessage(message)),
      take(1),
      mapTo(undefined)
    );
  }

  private filterPongMessage(message: object | string): boolean {
    return message === '3';
  }

  private initIncomingMessagesMapping(): Observable<StrangerEventUnion> {
    return this.webSocketMessages$!.pipe(
      skip(1),
      filter(message => this.filterObjectMessage(message)),
      map(message => this.mapIncomingMessage(message as IncomingMessageUnion)),
      filter(message => !!message)
    ) as Observable<StrangerEventUnion>;
  }

  private filterObjectMessage(message: object | string): boolean {
    return message !== null && typeof message === 'object';
  }

  private mapIncomingMessage(message: IncomingMessageUnion): StrangerEventUnion | null {
    switch (message.ev_name) {
      case IncomingMessage.conversationStart:
        return new ConversationStartEvent();

      case IncomingMessage.strangerMessage:
        return new StrangerMessageEvent({ message: message.ev_data.msg });

      case IncomingMessage.conversationEnd:
        return new ConversationEndEvent();

      case IncomingMessage.randomTopic:
        return new RandomTopicEvent({ topic: message.ev_data.topic });

      case IncomingMessage.prohibitedMessage:
        return new ProhibitedMessageEvent({ message: message.ev_data.msg });

      case IncomingMessage.usersCount:
        return new UsersCountEvent({ usersCount: message.ev_data });

      case IncomingMessage.strangerTyping:
        return message.ev_data ? new StrangerTypingStartEvent() : new StrangerTypingStopEvent();

      default:
        return null;
    }
  }

  private handleConnectionError(error: Error): Observable<void> {
    this.logger.error(error.message, error.stack, 'Stranger connection');
    this.webSocket$!.complete();
    this.cleanUpAfterConnectionDestroy();

    return throwError(new UnknownConnectionError());
  }

  private initConnectionDestroyHandling(): Observable<void> {
    return of(null).pipe(
      tap(() => this.cleanUpAfterConnectionDestroy()),
      filter(() => !this.isConnectionDestroyedByClient),
      switchMapTo(throwError(new UnknownConnectionError()))
    );
  }

  destroyConnection(): void {
    if (!this.isConnectionInitialized) {
      throw new ConnectionNotInitializedException();
    }

    this.webSocket$!.complete();
    this.cleanUpAfterConnectionDestroy();

    this.isConnectionDestroyedByClient = true;
  }

  private cleanUpAfterConnectionDestroy(): void {
    this.webSocket$ = null;
    this.webSocketMessages$ = null;
  }
}
