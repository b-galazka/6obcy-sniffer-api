import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway
} from '@nestjs/websockets';

import { Logger, UseFilters, UseInterceptors, UsePipes } from '@nestjs/common';
import { Observable } from 'rxjs';
import WebSocket = require('ws');

import {
  AppConfigService,
  BaseGateway,
  BaseOutputEvent,
  SanitizeRequestBodyPipe,
  WebSocketExceptionFilter,
  WebSocketValidationPipe
} from '../../core';

import {
  ConversationEndEvent,
  ConversationEventUnion,
  ConversationService,
  ConversationServiceFactory,
  ConversationStartEvent
} from '../core';

import { ConversationInputEvent } from './enums/conversation-input-event.enum';
import { ConversationExceptionInterceptor } from './interceptors/conversation-exception.interceptor';
import { MessageInputPayload } from './payloads/message-input.payload';

@WebSocketGateway()
@UsePipes(
  new SanitizeRequestBodyPipe(),
  new WebSocketValidationPipe({ forbidNonWhitelisted: true, whitelist: true })
)
@UseInterceptors(new ConversationExceptionInterceptor())
@UseFilters(new WebSocketExceptionFilter(new Logger('ConversationGateway')))
export class ConversationGateway extends BaseGateway
  implements OnGatewayConnection<WebSocket>, OnGatewayDisconnect<WebSocket> {
  private readonly initializedConversations = new WeakMap<WebSocket, ConversationService>();

  constructor(
    private readonly conversationServiceFactory: ConversationServiceFactory,
    appConfigService: AppConfigService
  ) {
    super(appConfigService);
  }

  handleConnection(socket: WebSocket): void {
    super.handleConnection(socket);

    const conversationService = this.conversationServiceFactory.constructService();

    this.initializedConversations.set(socket, conversationService);
    this.sendConnectionSuccessEvent(socket);
  }

  private sendConnectionSuccessEvent(socket: WebSocket): void {
    socket.send(JSON.stringify({ event: BaseOutputEvent.connectionSuccess }));
  }

  @SubscribeMessage(ConversationInputEvent.initialization)
  handleInitialization(@ConnectedSocket() socket: WebSocket): Observable<ConversationEventUnion> {
    const conversationService = this.initializedConversations.get(socket)!;
    return conversationService.initConnection();
  }

  @SubscribeMessage(ConversationInputEvent.conversationStart)
  handleConversationStart(
    @ConnectedSocket() socket: WebSocket
  ): Observable<ConversationStartEvent> {
    const conversationService = this.initializedConversations.get(socket)!;
    return conversationService.startConversation();
  }

  @SubscribeMessage(ConversationInputEvent.message)
  handleMessage(
    @ConnectedSocket() socket: WebSocket,
    @MessageBody() { messageReceivers, messageContent }: MessageInputPayload
  ): void {
    const conversationService = this.initializedConversations.get(socket)!;

    messageReceivers.forEach(messageReceiver => {
      conversationService.sendMessage(messageReceiver, messageContent);
    });
  }

  @SubscribeMessage(ConversationInputEvent.conversationEnd)
  handleConversationStop(@ConnectedSocket() socket: WebSocket): Observable<ConversationEndEvent> {
    const conversationService = this.initializedConversations.get(socket)!;
    return conversationService.endConversation();
  }

  handleDisconnect(socket: WebSocket): void {
    super.handleDisconnect(socket);

    const conversationService = this.initializedConversations.get(socket)!;

    conversationService.destroyConnection();
    this.initializedConversations.delete(socket);
  }
}
