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
  SanitizeRequestBodyPipe,
  WebSocketExceptionFilter
} from 'src/modules/core';

import { WebSocketValidationPipe } from 'src/modules/core/pipes/websocket-validation.pipe';
import { BaseInputPayload } from '../../core/websockets-payloads/base-input.payload';
import { ConversationService } from '../services/conversation/conversation.service';
import { InputEvent } from './events/input-event.enum';
import { MessageInputPayload } from './payloads/message-input.payload';

@WebSocketGateway(AppConfigService.constructFromEnvFile().getWsPort())
@UsePipes(
  new SanitizeRequestBodyPipe(),
  new WebSocketValidationPipe({ forbidNonWhitelisted: true, whitelist: true })
)
@UseFilters(new WebSocketExceptionFilter(new Logger('ConversationGateway')))
export class ConversationGateway
  implements OnGatewayConnection<WebSocket>, OnGatewayDisconnect<WebSocket> {
  // tslint:disable-next-line
  private readonly openedExternalConnections = new Map<WebSocket, ConversationService>();

  handleConnection(socket: WebSocket): void {
    // TODO: create instance of conversation service and store it in openedExternalConnections
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
    throw new Error('XD');

    console.log(payload);
    // TODO: send message to proper stranger
  }

  @SubscribeMessage(InputEvent.conversationStop)
  handleConversationStop(@MessageBody() payload: BaseInputPayload): void {
    console.log('conversation stop');
    // TODO: stop conversation
  }

  handleDisconnect(socket: WebSocket): void {
    // TODO: destroy connection with 6obcy API
    // TODO: remove instance of conversationService from openedExternalConnections
  }
}
