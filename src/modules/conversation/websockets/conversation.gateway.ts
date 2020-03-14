import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway
} from '@nestjs/websockets';

import { Logger, UseFilters, UsePipes } from '@nestjs/common';
import WebSocket = require('ws');

import {
  AppConfigService,
  BaseInputPayload,
  SanitizeRequestBodyPipe,
  WebSocketExceptionFilter,
  WebSocketValidationPipe
} from '../../core';

import { ConversationService, ConversationServiceFactory } from '../core';
import { InputEvent } from './enums/input-event.enum';
import { MessageInputPayload } from './payloads/message-input.payload';

@WebSocketGateway(AppConfigService.constructFromEnvFile().getWsPort())
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
    // TODO: initialize connection with 6obcy API
  }

  @SubscribeMessage(InputEvent.conversationStart)
  handleConversationStart(@MessageBody() payload: BaseInputPayload): void {
    console.log('conversation start');
    // TODO: start conversation if it is not already started
    // TODO: init conversation output events
  }

  @SubscribeMessage(InputEvent.message)
  handleMessage(@MessageBody() payload: MessageInputPayload): void {
    console.log(payload);
    // TODO: send message to proper stranger
  }

  @SubscribeMessage(InputEvent.conversationStop)
  handleConversationStop(@MessageBody() payload: BaseInputPayload): void {
    console.log('conversation stop');
    // TODO: stop conversation
  }

  handleDisconnect(socket: WebSocket): void {
    console.log('disconnect');
    // TODO: destroy connection with 6obcy API

    this.initializedConversations.delete(socket);
  }
}
