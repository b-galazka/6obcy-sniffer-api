import {
  catchError,
  filter,
  map,
  mapTo,
  mergeMap,
  share,
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

import {
  AppConfigService,
  isObject,
  tryToParseStrToObj,
  WebSocketConnectionFactory
} from '../../../../core';
import { ConversationEvent } from '../../enums/conversation-event.enum';
import { ConnectionAlreadyInitializedException } from '../../exceptions/connection-already-initialized.exception';
import { ConnectionNotInitializedException } from '../../exceptions/connection-not-initialized.exception';
import { ConversationAlreadyStartedException } from '../../exceptions/conversation-already-started.exception';
import { ConversationNotStartedException } from '../../exceptions/conversation-not-started.exception';
import { UnknownConnectionErrorException } from '../../exceptions/unknown-connection-error.exception';
import { ConnectionInitSuccessStrangerEvent } from './events/events/connection-init-success-stranger-event';
import { ConversationEndStrangerEvent } from './events/events/conversation-end-stranger-event';
import { ConversationStartStrangerEvent } from './events/events/conversation-start-stranger-event';
import { ProhibitedMessageStrangerEvent } from './events/events/prohibited-message-stranger-event';
import { RandomTopicStrangerEvent } from './events/events/random-topic-stranger-event';
import { StrangerMessageStrangerEvent } from './events/events/stranger-message-stranger-event';
import { StrangerTypingStartStrangerEvent } from './events/events/stranger-typing-start-stranger-event';
import { StrangerTypingStopStrangerEvent } from './events/events/stranger-typing-stop-stranger-event';
import { UsersCountStrangerEvent } from './events/events/users-count-stranger-event';
import { StrangerEventUnion } from './events/stranger-event-union.type';
import { IncomingMessageUnion } from './incoming-messages/incoming-message-union.type';
import { IncomingMessage } from './incoming-messages/incoming-message.enum';
import { IConversationStartIncomingMessage } from './incoming-messages/messages/conversation-start-incoming-message.interface';
import { IInitialIncomingMessage } from './incoming-messages/messages/initial-incoming-message.interface';
import { ConversationEndOutcomingMessage } from './outcoming-messages/messages/conversation-end-outcoming-message';
import { ConversationStartOutcomingMessage } from './outcoming-messages/messages/conversation-start-outcoming-message';
import { MessageOutcomingMessage } from './outcoming-messages/messages/message-outcoming-message';
import { TypingOutcomingMessage } from './outcoming-messages/messages/typing-outcoming-message';
import { OutcomingMessageUnion } from './outcoming-messages/outcoming-message-union.type';

@Injectable()
export class StrangerService {
  private webSocket$: WebSocketSubject<string> | null;
  private webSocketMessages$: Observable<object | string> | null;
  private webSocketObjectMessages$: Observable<object> | null;

  private isConnectionDestroyedByClient = false;
  private isConversationEndedByClient = false;
  private conversationKey: string | null;
  private outcomingSocketMessageId = 0;

  get isConnectionInitialized(): boolean {
    return !!this.webSocket$;
  }

  get isConversationStarted(): boolean {
    return !!this.conversationKey;
  }

  constructor(
    private readonly webSocketConnectionFactory: WebSocketConnectionFactory,
    private readonly logger: Logger,
    private readonly appConfigService: AppConfigService
  ) {}

  initConnection(): Observable<StrangerEventUnion> {
    if (this.isConnectionInitialized) {
      throw new ConnectionAlreadyInitializedException();
    }

    this.isConnectionDestroyedByClient = false;

    this.webSocket$ = this.webSocketConnectionFactory.constructWebSocketConnection(
      this.appConfigService.getWsApiUrl(),
      this.appConfigService.getWsOriginUrl()
    );

    this.webSocketMessages$ = this.webSocket$.pipe(map(tryToParseStrToObj));

    this.webSocketObjectMessages$ = this.webSocketMessages$.pipe(
      filter(isObject)
    ) as Observable<object>;

    return concat(this.initWebSocketMessagesHandling(), this.initConnectionDestroyHandling()).pipe(
      share()
    );
  }

  private initWebSocketMessagesHandling(): Observable<StrangerEventUnion> {
    return merge(
      this.initInitialIncomingMessageHandling(),
      this.initIncomingMessagesMapping().pipe(
        tap(event => this.deleteConversationKeyOnConversationEndEvent(event))
      )
    ).pipe(catchError(error => this.handleConnectionError(error)));
  }

  private initInitialIncomingMessageHandling(): Observable<ConnectionInitSuccessStrangerEvent> {
    return merge(this.initInitialIncomingMessageMapping(), this.initHeartbeat());
  }

  private initInitialIncomingMessageMapping(): Observable<ConnectionInitSuccessStrangerEvent> {
    return this.webSocketMessages$!.pipe(take(1), mapTo(this.mapInitialIncomingMessage()));
  }

  private mapInitialIncomingMessage(): ConnectionInitSuccessStrangerEvent {
    return new ConnectionInitSuccessStrangerEvent();
  }

  private initHeartbeat(): Observable<never> {
    return this.webSocketMessages$!.pipe(
      take(1),
      switchMap(({ pingInterval, pingTimeout }: IInitialIncomingMessage) =>
        this.initPingInterval(pingInterval, pingTimeout)
      ),
      filter(() => false)
    ) as Observable<never>;
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
    return this.webSocketObjectMessages$!.pipe(
      skip(1),
      map(message => this.mapIncomingMessage(message as IncomingMessageUnion)),
      filter(message => !!message)
    ) as Observable<StrangerEventUnion>;
  }

  private mapIncomingMessage(message: IncomingMessageUnion): StrangerEventUnion | null {
    switch (message.ev_name) {
      case IncomingMessage.strangerMessage:
        return new StrangerMessageStrangerEvent({ message: message.ev_data.msg });

      case IncomingMessage.conversationEnd:
        return this.isConversationEndedByClient ? null : new ConversationEndStrangerEvent();

      case IncomingMessage.randomTopic:
        return new RandomTopicStrangerEvent({ topic: message.ev_data.topic });

      case IncomingMessage.prohibitedMessage:
        return new ProhibitedMessageStrangerEvent({ message: message.ev_data.msg });

      case IncomingMessage.usersCount:
        return new UsersCountStrangerEvent({ usersCount: message.ev_data });

      case IncomingMessage.strangerTyping:
        return message.ev_data
          ? new StrangerTypingStartStrangerEvent()
          : new StrangerTypingStopStrangerEvent();

      default:
        return null;
    }
  }

  private deleteConversationKeyOnConversationEndEvent({ event }: StrangerEventUnion): void {
    if (event === ConversationEvent.conversationEnd) {
      this.conversationKey = null;
    }
  }

  private handleConnectionError(error: Error): Observable<never> {
    this.logger.error(error.message, error.stack, 'Stranger connection');
    this.webSocket$!.complete();
    this.makeConnectionDestroyCleanUp();

    return throwError(new UnknownConnectionErrorException());
  }

  private initConnectionDestroyHandling(): Observable<never> {
    return of(null).pipe(
      tap(() => this.makeConnectionDestroyCleanUp()),
      filter(() => !this.isConnectionDestroyedByClient),
      switchMapTo(throwError(new UnknownConnectionErrorException()))
    );
  }

  startConversation(): Observable<ConversationStartStrangerEvent> {
    if (!this.isConnectionInitialized) {
      throw new ConnectionNotInitializedException();
    }

    if (this.isConversationStarted) {
      throw new ConversationAlreadyStartedException();
    }

    this.isConversationEndedByClient = false;

    this.sendSocketMessage(new ConversationStartOutcomingMessage());

    return this.filterFirstConversationStartIncomingMessage().pipe(
      tap(message => this.setConversationKey(message as IConversationStartIncomingMessage)),
      mapTo(new ConversationStartStrangerEvent())
    );
  }

  private isConversationStartIncomingMessage(message: IncomingMessageUnion): boolean {
    return message.ev_name === IncomingMessage.conversationStart;
  }

  private setConversationKey({ ev_data }: IConversationStartIncomingMessage): void {
    this.conversationKey = ev_data.ckey;
  }

  waitForConversationStart(): Observable<void> {
    return this.isConversationStarted
      ? of(undefined)
      : this.filterFirstConversationStartIncomingMessage().pipe(mapTo(undefined));
  }

  private filterFirstConversationStartIncomingMessage(): Observable<IConversationStartIncomingMessage> {
    return this.webSocketObjectMessages$!.pipe(
      filter(message => this.isConversationStartIncomingMessage(message as IncomingMessageUnion)),
      take(1)
    ) as Observable<IConversationStartIncomingMessage>;
  }

  notifyAboutTypingStart(): void {
    this.notifyAboutTypingStatusChange(true);
  }

  notifyAboutTypingStop(): void {
    this.notifyAboutTypingStatusChange(false);
  }

  private notifyAboutTypingStatusChange(isTyping: boolean): void {
    if (!this.isConnectionInitialized) {
      throw new ConnectionNotInitializedException();
    }

    if (!this.isConversationStarted) {
      throw new ConversationNotStartedException();
    }

    this.sendSocketMessage(new TypingOutcomingMessage(this.conversationKey!, isTyping));
  }

  sendMessage(message: string): void {
    if (!this.isConnectionInitialized) {
      throw new ConnectionNotInitializedException();
    }

    if (!this.isConversationStarted) {
      throw new ConversationNotStartedException();
    }

    this.sendSocketMessage(new MessageOutcomingMessage(this.conversationKey!, message));
  }

  endConversation(): Observable<ConversationEndStrangerEvent> {
    if (!this.isConnectionInitialized) {
      throw new ConnectionNotInitializedException();
    }

    if (!this.isConversationStarted) {
      throw new ConversationNotStartedException();
    }

    this.isConversationEndedByClient = true;
    this.conversationKey = null;

    this.sendSocketMessage(new ConversationEndOutcomingMessage(this.conversationKey!));

    return this.webSocketObjectMessages$!.pipe(
      filter(message => this.isConversationEndIncomingMessage(message as IncomingMessageUnion)),
      mapTo(new ConversationEndStrangerEvent()),
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
    this.webSocketObjectMessages$ = null;
    this.conversationKey = null;
    this.outcomingSocketMessageId = 0;
  }
}
