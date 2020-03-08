import { WebSocketGateway } from '@nestjs/websockets';

import { AppConfigService } from 'src/modules/core';

// TODO: add validation
@WebSocketGateway(AppConfigService.constructFromEnvFile().getWsPort())
export class ConversationGateway {}
