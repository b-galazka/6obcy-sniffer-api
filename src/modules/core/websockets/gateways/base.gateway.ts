import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WsResponse
} from '@nestjs/websockets';
import { BehaviorSubject, combineLatest, interval, Observable, Subject } from 'rxjs';
import {
  filter,
  map,
  mapTo,
  mergeMap,
  shareReplay,
  startWith,
  take,
  takeWhile,
  tap,
  timeout
} from 'rxjs/operators';
import WebSocket = require('ws');

import { AppConfigService } from '../../shared';
import { BaseInputEvent } from '../enums/base-input-event.enum';
import { BaseOutputEvent } from '../enums/base-output-event.enum';

export abstract class BaseGateway
  implements OnGatewayConnection<WebSocket>, OnGatewayDisconnect<WebSocket> {
  private readonly pingInterval = this.appConfigService.getPingInterval();
  private readonly pingTimeout = this.appConfigService.getPingTimeout();
  private readonly heartbeats = new Map<WebSocket, BehaviorSubject<number>>();
  private readonly heartbeatsIntervals = new Map<WebSocket, Observable<number>>();

  constructor(private readonly appConfigService: AppConfigService) {}

  handleConnection(socket: WebSocket): void {
    this.initHeartbeat(socket);
  }

  private initHeartbeat(socket: WebSocket): void {
    const heartbeat$ = new BehaviorSubject<number>(0);

    const heartbeatInterval$ = interval(this.pingInterval).pipe(
      map(ordinalNumber => ordinalNumber + 1),
      startWith(0),
      shareReplay(1)
    );

    this.heartbeats.set(socket, heartbeat$);
    this.heartbeatsIntervals.set(socket, heartbeatInterval$);

    heartbeatInterval$
      .pipe(
        filter(ordinalNumber => ordinalNumber > 0),
        mergeMap(ordinalNumber => this.setPingTimeout(heartbeat$, ordinalNumber)),
        takeWhile(() => !heartbeat$.isStopped)
      )
      .subscribe({
        error: () => this.handlePingTimeout(socket)
      });
  }

  private setPingTimeout(
    heartbeat$: Subject<number>,
    expectedPingOrdinalNumber: number
  ): Observable<number> {
    return heartbeat$.pipe(
      filter(pingOrdinalNumber => pingOrdinalNumber === expectedPingOrdinalNumber),
      take(1),
      timeout(this.pingTimeout)
    );
  }

  private handlePingTimeout(socket: WebSocket): void {
    const heartbeat$ = this.heartbeats.get(socket)!;

    socket.close(undefined, 'heartbeat timeout');
    heartbeat$.complete();
  }

  @SubscribeMessage(BaseInputEvent.ping)
  handlePing(@ConnectedSocket() socket: WebSocket): Observable<WsResponse<void>> {
    const heartbeatInterval$ = this.heartbeatsIntervals.get(socket)!;
    const heartbeat$ = this.heartbeats.get(socket)!;

    return combineLatest([heartbeatInterval$, heartbeat$]).pipe(
      take(1),
      tap(heartbeatOrdinalNumbers => {
        this.resolvePingTimeout(heartbeat$, ...heartbeatOrdinalNumbers);
      }),
      mapTo({ event: BaseOutputEvent.pong, data: undefined })
    );
  }

  private resolvePingTimeout(
    heartbeat$: Subject<number>,
    heartbeatIntervalOrdinalNumber: number,
    lastPingOrdinalNumber: number
  ): void {
    const pingOrdinalNumber = Math.min(heartbeatIntervalOrdinalNumber, lastPingOrdinalNumber + 1);

    heartbeat$.next(pingOrdinalNumber);
  }

  handleDisconnect(socket: WebSocket): void {
    this.destroyHeartbeat(socket);
  }

  private destroyHeartbeat(socket: WebSocket): void {
    const heartbeat$ = this.heartbeats.get(socket)!;

    heartbeat$.complete();
    this.heartbeats.delete(socket);
    this.heartbeatsIntervals.delete(socket);
  }
}
