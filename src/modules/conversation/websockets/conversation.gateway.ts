import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway
} from '@nestjs/websockets';

import { Logger, UseFilters, UsePipes } from '@nestjs/common';
import { Observable } from 'rxjs';
import WebSocket = require('ws');

import {
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
import { InputEvent } from './enums/input-event.enum';
import { MessageInputPayload } from './payloads/message-input.payload';

// TODO: implement ping-pong
// TODO: map converastion exceptions to websocket exceptions

@WebSocketGateway()
@UsePipes(
  new SanitizeRequestBodyPipe(),
  new WebSocketValidationPipe({ forbidNonWhitelisted: true, whitelist: true })
)
@UseFilters(new WebSocketExceptionFilter(new Logger('ConversationGateway')))
export class ConversationGateway
  implements OnGatewayConnection<WebSocket>, OnGatewayDisconnect<WebSocket> {
  private readonly initializedConversations = new Map<WebSocket, ConversationService>();

  constructor(private readonly conversationServiceFactory: ConversationServiceFactory) {}

  handleConnection(socket: WebSocket): void {
    const conversationService = this.conversationServiceFactory.constructService();
    this.initializedConversations.set(socket, conversationService);
  }

  @SubscribeMessage(InputEvent.initialization)
  handleInitialization(@ConnectedSocket() socket: WebSocket): Observable<ConversationEventUnion> {
    const conversationService = this.initializedConversations.get(socket)!;
    return conversationService.initConnection();
  }

  @SubscribeMessage(InputEvent.conversationStart)
  handleConversationStart(
    @ConnectedSocket() socket: WebSocket
  ): Observable<ConversationStartEvent> {
    const conversationService = this.initializedConversations.get(socket)!;
    return conversationService.startConversation();
  }

  @SubscribeMessage(InputEvent.message)
  handleMessage(
    @ConnectedSocket() socket: WebSocket,
    @MessageBody() { messageReceivers, messageContent }: MessageInputPayload
  ): void {
    const conversationService = this.initializedConversations.get(socket)!;

    messageReceivers.forEach(messageReceiver => {
      conversationService.sendMessage(messageReceiver, messageContent);
    });
  }

  @SubscribeMessage(InputEvent.conversationEnd)
  handleConversationStop(@ConnectedSocket() socket: WebSocket): Observable<ConversationEndEvent> {
    const conversationService = this.initializedConversations.get(socket)!;
    return conversationService.endConversation();
  }

  handleDisconnect(socket: WebSocket): void {
    const conversationService = this.initializedConversations.get(socket)!;

    conversationService.destroyConnection();
    this.initializedConversations.delete(socket);
  }
}
