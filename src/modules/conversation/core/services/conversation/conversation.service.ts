import { Injectable } from '@nestjs/common';
import { forkJoin, merge, Observable, of } from 'rxjs';
import { filter, map, mapTo } from 'rxjs/operators';

import { ConversationEvent } from '../../enums/conversation-event.enum';
import { Stranger } from '../../enums/stranger.enum';
import { StrangerEventUnion } from '../stranger/events/stranger-event-union.type';
import { StrangerService } from '../stranger/stranger.service';
import { ConversationEventUnion } from './events/conversation-event-union.type';
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
  constructor(
    private readonly firstStrangerService: StrangerService,
    private readonly secondStrangerService: StrangerService
  ) {}

  initConnection(): Observable<ConversationEventUnion> {
    const firstConversationEvents$ = this.initStrangerConnection(Stranger.first);
    const secondConversationEvents$ = this.initStrangerConnection(Stranger.second);

    return merge(
      this.filterUsersCountEvent(firstConversationEvents$),
      this.filterEventsOtherThanUsersCount(firstConversationEvents$),
      this.filterEventsOtherThanUsersCount(secondConversationEvents$),
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
    doer: Stranger,
    event: StrangerEventUnion
  ): ConversationEventUnion | null {
    switch (event.event) {
      case ConversationEvent.strangerMessage:
        return new StrangerMessageEvent({ ...event.data, doer });

      case ConversationEvent.conversationEnd:
        return new ConversationEndEvent({ doer });

      case ConversationEvent.randomTopic:
        return new RandomTopicEvent({ ...event.data, doer });

      case ConversationEvent.prohibitedMessage:
        return new ProhibitedMessageEvent(event.data);

      case ConversationEvent.usersCount:
        return new UsersCountEvent(event.data);

      case ConversationEvent.strangerTypingStart:
        return new StrangerTypingStartEvent({ doer });

      case ConversationEvent.strangerTypingStop:
        return new StrangerTypingStopEvent({ doer });

      default:
        return null;
    }
  }

  private filterUsersCountEvent(
    conversationEvents$: Observable<ConversationEventUnion>
  ): Observable<UsersCountEvent> {
    return conversationEvents$.pipe(filter(event => this.isUsersCountEvent(event))) as Observable<
      UsersCountEvent
    >;
  }

  private filterEventsOtherThanUsersCount(
    conversationEvents$: Observable<ConversationEventUnion>
  ): Observable<ConversationEventUnion> {
    return conversationEvents$.pipe(filter(event => !this.isUsersCountEvent(event)));
  }

  private isUsersCountEvent(event: ConversationEventUnion): boolean {
    return event.event === ConversationEvent.usersCount;
  }

  private initEventsForwarding(
    conversationEvents$: Observable<ConversationEventUnion>
  ): Observable<never> {
    // TODO: implement
    return of();
  }

  startConversation(): Observable<ConversationStartEvent> {
    return forkJoin([
      this.firstStrangerService.startConversation(),
      this.secondStrangerService.startConversation()
    ]).pipe(mapTo(new ConversationStartEvent()));
  }

  // tslint:disable-next-line
  private notifyAboutTypingStart(receiver: Stranger): void {
    this.getStrangerService(receiver)!.notifyAboutTypingStart();
  }

  // tslint:disable-next-line
  private notifyAboutTypingStop(receiver: Stranger): void {
    this.getStrangerService(receiver)!.notifyAboutTypingStop();
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
    ]).pipe(mapTo(new ConversationEndEvent({ doer: null })));
  }

  destroyConnection(): void {
    this.firstStrangerService.destroyConnection();
    this.secondStrangerService.destroyConnection();
  }
}
