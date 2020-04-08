import { Injectable } from '@nestjs/common';
import { forkJoin, merge, Observable, Subject } from 'rxjs';
import { filter, map, mapTo, skip, take, takeUntil, tap } from 'rxjs/operators';

import { ConversationEvent } from '../../enums/conversation-event.enum';
import { Stranger } from '../../enums/stranger.enum';
import { StrangerEventUnion } from '../stranger/events/stranger-event-union.type';
import { StrangerService } from '../stranger/stranger.service';
import { ConversationEventUnion } from './events/conversation-event-union.type';
import { ConnectionInitSuccessEvent } from './events/events/connection-init-success-event';
import { ConversationEndEvent } from './events/events/conversation-end-event';
import { ConversationStartEvent } from './events/events/conversation-start-event';
import { ProhibitedMessageEvent } from './events/events/prohibited-message-event';
import { RandomTopicEvent } from './events/events/random-topic-event';
import { StrangerMessageEvent } from './events/events/stranger-message-event';
import { StrangerTypingStartEvent } from './events/events/stranger-typing-start-event';
import { StrangerTypingStopEvent } from './events/events/stranger-typing-stop-event';
import { UsersCountEvent } from './events/events/users-count-event';

@Injectable()
export class ConversationService {
  private readonly conversationEnd$ = new Subject<void>();

  constructor(
    private readonly firstStrangerService: StrangerService,
    private readonly secondStrangerService: StrangerService
  ) {}

  initConnection(): Observable<ConversationEventUnion> {
    const firstConversationEvents$ = this.initStrangerConnection(Stranger.first);
    const secondConversationEvents$ = this.initStrangerConnection(Stranger.second);

    return merge(
      this.handleConnectionInitSuccessEvent(firstConversationEvents$, secondConversationEvents$),
      this.filterStatisticsEvents(firstConversationEvents$),
      this.filterConversationEvents(firstConversationEvents$),
      this.filterConversationEvents(secondConversationEvents$),
      this.initEventsForwarding(firstConversationEvents$),
      this.initEventsForwarding(secondConversationEvents$)
    );
  }

  private initStrangerConnection(stranger: Stranger): Observable<ConversationEventUnion> {
    return this.getStrangerService(stranger)!
      .initConnection()
      .pipe(
        map(event => this.mapStrangerEventToConversationEvent(stranger, event)),
        filter(event => !!event)
      ) as Observable<ConversationEventUnion>;
  }

  private mapStrangerEventToConversationEvent(
    notifier: Stranger,
    event: StrangerEventUnion
  ): ConversationEventUnion | null {
    switch (event.event) {
      case ConversationEvent.connectionInitSuccess:
        return new ConnectionInitSuccessEvent();

      case ConversationEvent.strangerMessage:
        return new StrangerMessageEvent({ ...event.data, notifier });

      case ConversationEvent.conversationEnd:
        return new ConversationEndEvent({ notifier });

      case ConversationEvent.randomTopic:
        return new RandomTopicEvent({ ...event.data, notifier });

      case ConversationEvent.prohibitedMessage:
        return new ProhibitedMessageEvent(event.data);

      case ConversationEvent.usersCount:
        return new UsersCountEvent(event.data);

      case ConversationEvent.strangerTypingStart:
        return new StrangerTypingStartEvent({ notifier });

      case ConversationEvent.strangerTypingStop:
        return new StrangerTypingStopEvent({ notifier });

      default:
        return null;
    }
  }

  private handleConnectionInitSuccessEvent(
    firstConversationEvents$: Observable<ConversationEventUnion>,
    secondConversationEvents$: Observable<ConversationEventUnion>
  ): Observable<ConnectionInitSuccessEvent> {
    return forkJoin([
      firstConversationEvents$.pipe(take(1)),
      secondConversationEvents$.pipe(take(1))
    ]).pipe(mapTo(new ConnectionInitSuccessEvent()));
  }

  private filterStatisticsEvents(
    conversationEvents$: Observable<ConversationEventUnion>
  ): Observable<UsersCountEvent> {
    return conversationEvents$.pipe(filter(event => this.isUsersCountEvent(event))) as Observable<
      UsersCountEvent
    >;
  }

  private filterConversationEvents(
    conversationEvents$: Observable<ConversationEventUnion>
  ): Observable<ConversationEventUnion> {
    return conversationEvents$.pipe(
      skip(1),
      filter(event => !this.isUsersCountEvent(event))
    );
  }

  private isUsersCountEvent({ event }: ConversationEventUnion): boolean {
    return event === ConversationEvent.usersCount;
  }

  private initEventsForwarding(
    conversationEvents$: Observable<ConversationEventUnion>
  ): Observable<never> {
    return merge(
      this.initStrangerTypingStartEventsForwarding(conversationEvents$),
      this.initStrangerTypingStopEventsForwarding(conversationEvents$),
      this.initStrangerMessageEventsForwarding(conversationEvents$),
      this.initEndConversationEventsForwarding(conversationEvents$)
    ).pipe(filter(() => false)) as Observable<never>;
  }

  private initStrangerTypingStartEventsForwarding(
    conversationEvents$: Observable<ConversationEventUnion>
  ): Observable<StrangerTypingStartEvent> {
    return conversationEvents$.pipe(
      filter(event => this.isStrangerTypingStartEvent(event)),
      tap((event: StrangerTypingStartEvent) => this.forwardStrangerTypingStartEvent(event))
    );
  }

  private isStrangerTypingStartEvent({ event }: ConversationEventUnion): boolean {
    return event === ConversationEvent.strangerTypingStart;
  }

  private forwardStrangerTypingStartEvent(event: StrangerTypingStartEvent): void {
    const eventReceiverStrangerService = this.getEventReceiverStrangerService(
      event.data.notifier!
    )!;

    if (eventReceiverStrangerService.isConversationStarted) {
      eventReceiverStrangerService.notifyAboutTypingStart();
    }
  }

  private initStrangerTypingStopEventsForwarding(
    conversationEvents$: Observable<ConversationEventUnion>
  ): Observable<StrangerTypingStopEvent> {
    return conversationEvents$.pipe(
      filter(event => this.isStrangerTypingStopEvent(event)),
      tap((event: StrangerTypingStopEvent) => this.forwardStrangerTypingStopEvent(event))
    );
  }

  private isStrangerTypingStopEvent({ event }: ConversationEventUnion): boolean {
    return event === ConversationEvent.strangerTypingStop;
  }

  private forwardStrangerTypingStopEvent(event: StrangerTypingStopEvent): void {
    const eventReceiverStrangerService = this.getEventReceiverStrangerService(
      event.data.notifier!
    )!;

    if (eventReceiverStrangerService.isConversationStarted) {
      eventReceiverStrangerService.notifyAboutTypingStop();
    }
  }

  private initStrangerMessageEventsForwarding(
    conversationEvents$: Observable<ConversationEventUnion>
  ): Observable<StrangerMessageEvent> {
    return conversationEvents$.pipe(
      filter(event => this.isStrangerMessageEvent(event)),
      tap((event: StrangerMessageEvent) => this.forwardStrangerMessageEvent(event))
    );
  }

  private isStrangerMessageEvent({ event }: ConversationEventUnion): boolean {
    return event === ConversationEvent.strangerMessage;
  }

  private forwardStrangerMessageEvent(event: StrangerMessageEvent): void {
    const eventReceiverStrangerService = this.getEventReceiverStrangerService(
      event.data.notifier!
    )!;

    eventReceiverStrangerService
      .waitForConversationStart()
      .pipe(takeUntil(this.conversationEnd$))
      .subscribe(() => eventReceiverStrangerService.sendMessage(event.data.message));
  }

  private initEndConversationEventsForwarding(
    conversationEvents$: Observable<ConversationEventUnion>
  ): Observable<ConversationEndEvent> {
    return conversationEvents$.pipe(
      filter(event => this.isConversationEndEvent(event)),
      tap((event: ConversationEndEvent) => this.forwardConversationEndEvent(event))
    );
  }

  private isConversationEndEvent({ event }: ConversationEventUnion): boolean {
    return event === ConversationEvent.conversationEnd;
  }

  private forwardConversationEndEvent(event: ConversationEndEvent): void {
    this.conversationEnd$.next();

    const eventReceiverStrangerService = this.getEventReceiverStrangerService(
      event.data.notifier!
    )!;

    if (eventReceiverStrangerService.isConversationStarted) {
      eventReceiverStrangerService.endConversation();
    }
  }

  private getEventReceiverStrangerService(eventNotifier: Stranger): StrangerService | null {
    switch (eventNotifier) {
      case Stranger.first:
        return this.secondStrangerService;

      case Stranger.second:
        return this.firstStrangerService;

      default:
        return null;
    }
  }

  startConversation(): Observable<ConversationStartEvent> {
    return forkJoin([
      this.firstStrangerService.startConversation(),
      this.secondStrangerService.startConversation()
    ]).pipe(mapTo(new ConversationStartEvent()));
  }

  sendMessage(receiver: Stranger, message: string): void {
    this.getStrangerService(receiver)!.sendMessage(message);
  }

  private getStrangerService(stranger: Stranger): StrangerService | null {
    switch (stranger) {
      case Stranger.first:
        return this.firstStrangerService;

      case Stranger.second:
        return this.secondStrangerService;

      default:
        return null;
    }
  }

  endConversation(): Observable<ConversationEndEvent> {
    return forkJoin([
      this.firstStrangerService.endConversation(),
      this.secondStrangerService.endConversation()
    ]).pipe(
      tap(() => this.conversationEnd$.next()),
      mapTo(new ConversationEndEvent({ notifier: null }))
    );
  }

  destroyConnection(): void {
    this.conversationEnd$.next();
    this.firstStrangerService.destroyConnection();
    this.secondStrangerService.destroyConnection();
  }
}
