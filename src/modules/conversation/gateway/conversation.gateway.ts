import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway
} from '@nestjs/websockets';

import { UsePipes, ValidationPipe } from '@nestjs/common';
import WebSocket = require('ws');

import { AppConfigService, SanitizeRequestBodyPipe } from 'src/modules/core';
import { ConversationService } from '../services/conversation/conversation.service';
import { InputEvent } from './events/input-event.enum';
import { MessagePayload } from './payloads/message.payload';

// TODO: add exceptions filter
@WebSocketGateway(AppConfigService.constructFromEnvFile().getWsPort())
@UsePipes(
  new SanitizeRequestBodyPipe(),
  new ValidationPipe({ forbidNonWhitelisted: true, whitelist: true })
)
export class ConversationGateway
  implements OnGatewayConnection<WebSocket>, OnGatewayDisconnect<WebSocket> {
  // tslint:disable-next-line
  private readonly openedExternalConnections = new Map<WebSocket, ConversationService>();

  handleConnection(socket: WebSocket): void {
    // TODO: create instance of conversation service and store it in openedExternalConnections
    // TODO: initialize connection with 6obcy API
  }

  @SubscribeMessage(InputEvent.conversationStart)
  handleConversationStart(): void {
    console.log('conversation start');
    // TODO: start conversation if it is not already started
    // TODO: init conversation output events
  }

  @SubscribeMessage(InputEvent.message)
  handleMessage(@MessageBody() payload: MessagePayload): void {
    console.log(payload);
    // TODO: send message to proper stranger
  }

  @SubscribeMessage(InputEvent.conversationStop)
  handleConversationStop(): void {
    console.log('conversation stop');
    // TODO: stop conversation
  }

  handleDisconnect(socket: WebSocket): void {
    // TODO: destroy connection with 6obcy API
    // TODO: remove instance of conversationService from openedExternalConnections
  }
}
