import { WsAdapter } from '@nestjs/platform-ws';

export class WebSocketAdapter extends WsAdapter {
  constructor(private readonly port: number, appOrHttpServer?: any) {
    super(appOrHttpServer);
  }

  create(port: number, options: any): any {
    return super.create(port || this.port, options);
  }
}
