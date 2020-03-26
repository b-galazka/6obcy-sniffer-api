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
import { ConversationAlreadyStartedException } from '../../exceptions/conversation-already-started.exception';
import { ConversationNotStartedException } from '../../exceptions/conversation-not-started.exception';
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
import { StrangerEvent } from './events/stranger-event.enum';
import { IncomingMessageUnion } from './incoming-messages/incoming-message-union.type';
import { IncomingMessage } from './incoming-messages/incoming-message.enum';
import { IConversationStartIncomingMessage } from './incoming-messages/messages/conversation-start-incoming-message.interface';
import { IInitialIncomingMessage } from './incoming-messages/messages/initial-incoming-message.interface';
import { ConversationEndOutcomingMessage } from './outcoming-messages/messages/conversation-end-outcoming-message';
import { ConversationStartOutcomingMessage } from './outcoming-messages/messages/conversation-start-outcoming-message';
import { MessageOutcomingMessage } from './outcoming-messages/messages/message-outcoming-message';
import { TypingOutcomingMessage } from './outcoming-messages/messages/typing-outcoming-message';
import { OutcomingMessageUnion } from './outcoming-messages/outcoming-message-union.type';

// TODO: create namespaces for events, incoming messages and outcoming messages

@Injectable()
export class StrangerService {
  private webSocket$: WebSocketSubject<string> | null;
  private webSocketMessages$: Observable<object | string> | null;

  private isConnectionDestroyedByClient = false;
  private isConversationEndedByClient = false;
  private conversationKey: string | null;
  private outcomingSocketMessageId = 0;

  constructor(
    private readonly webSocketConnectionFactory: WebSocketConnectionFactory,
    private readonly logger: Logger,
    private readonly appConfigService: AppConfigService
  ) {}

  get isConnectionInitialized(): boolean {
    return !!this.webSocket$;
  }

  get isConversationStarted(): boolean {
    return !!this.conversationKey;
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
      this.initIncomingMessagesMapping().pipe(
        tap(event => this.deleteConversationKeyOnConversationEndEvent(event))
      )
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
      filter(message => this.isPongMessage(message)),
      take(1),
      mapTo(undefined)
    );
  }

  private isPongMessage(message: object | string): boolean {
    return message === '3';
  }

  private initIncomingMessagesMapping(): Observable<StrangerEventUnion> {
    return this.webSocketMessages$!.pipe(
      skip(1),
      filter(message => this.isObjectMessage(message)),
      map(message => this.mapIncomingMessage(message as IncomingMessageUnion)),
      filter(message => !!message)
    ) as Observable<StrangerEventUnion>;
  }

  private isObjectMessage(message: object | string): boolean {
    return message !== null && typeof message === 'object';
  }

  private mapIncomingMessage(message: IncomingMessageUnion): StrangerEventUnion | null {
    switch (message.ev_name) {
      case IncomingMessage.strangerMessage:
        return new StrangerMessageEvent({ message: message.ev_data.msg });

      case IncomingMessage.conversationEnd:
        return this.isConversationEndedByClient ? null : new ConversationEndEvent();

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

  private deleteConversationKeyOnConversationEndEvent({ event }: StrangerEventUnion): void {
    if (event === StrangerEvent.conversationEnd) {
      this.conversationKey = null;
    }
  }

  private handleConnectionError(error: Error): Observable<void> {
    this.logger.error(error.message, error.stack, 'Stranger connection');
    this.webSocket$!.complete();
    this.makeConnectionDestroyCleanUp();

    return throwError(new UnknownConnectionError());
  }

  private initConnectionDestroyHandling(): Observable<void> {
    return of(null).pipe(
      tap(() => this.makeConnectionDestroyCleanUp()),
      filter(() => !this.isConnectionDestroyedByClient),
      switchMapTo(throwError(new UnknownConnectionError()))
    );
  }

  startConversation(): Observable<ConversationStartEvent> {
    if (this.isConversationStarted) {
      throw new ConversationAlreadyStartedException();
    }

    this.isConversationEndedByClient = false;

    this.sendSocketMessage(new ConversationStartOutcomingMessage());

    return this.webSocketMessages$!.pipe(
      filter(message => this.isObjectMessage(message)),
      filter(message => this.isConversationStartIncomingMessage(message as IncomingMessageUnion)),
      tap(message => this.setConversationKey(message as IConversationStartIncomingMessage)),
      mapTo(new ConversationStartEvent()),
      take(1)
    );
  }

  private isConversationStartIncomingMessage(message: IncomingMessageUnion): boolean {
    return message.ev_name === IncomingMessage.conversationStart;
  }

  private setConversationKey({ ev_data }: IConversationStartIncomingMessage): void {
    this.conversationKey = ev_data.ckey;
  }

  notifyAboutTypingStart(): void {
    this.notifyAboutTypingStatusChange(true);
  }

  notifyAboutTypingStop(): void {
    this.notifyAboutTypingStatusChange(false);
  }

  private notifyAboutTypingStatusChange(isTyping: boolean): void {
    if (!this.isConversationStarted) {
      throw new ConversationNotStartedException();
    }

    this.sendSocketMessage(new TypingOutcomingMessage(this.conversationKey!, isTyping));
  }

  sendMessage(message: string): void {
    if (!this.isConversationStarted) {
      throw new ConversationNotStartedException();
    }

    this.sendSocketMessage(new MessageOutcomingMessage(this.conversationKey!, message));
  }

  endConversation(): Observable<ConversationEndEvent> {
    if (!this.isConversationStarted) {
      throw new ConversationNotStartedException();
    }

    this.isConversationEndedByClient = true;
    this.conversationKey = null;

    this.sendSocketMessage(new ConversationEndOutcomingMessage(this.conversationKey!));

    return this.webSocketMessages$!.pipe(
      filter(message => this.isObjectMessage(message)),
      filter(message => this.isConversationEndIncomingMessage(message as IncomingMessageUnion)),
      mapTo(new ConversationEndEvent()),
      take(1)
    );
  }

  private isConversationEndIncomingMessage(message: IncomingMessageUnion): boolean {
    return message.ev_name === IncomingMessage.conversationEnd;
  }

  private sendSocketMessage(message: OutcomingMessageUnion): void {
    const payload = `4${JSON.stringify({ ...message, ceid: ++this.outcomingSocketMessageId })}`;

    this.webSocket$!.next(payload);
  }

  destroyConnection(): void {
    if (!this.isConnectionInitialized) {
      throw new ConnectionNotInitializedException();
    }

    this.webSocket$!.complete();
    this.makeConnectionDestroyCleanUp();

    this.isConnectionDestroyedByClient = true;
  }

  private makeConnectionDestroyCleanUp(): void {
    this.webSocket$ = null;
    this.webSocketMessages$ = null;
    this.conversationKey = null;
    this.outcomingSocketMessageId = 0;
  }
}
