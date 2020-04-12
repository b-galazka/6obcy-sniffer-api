import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}

  getPort(): number {
    return +(this.configService.get<string>('PORT') || 3000);
  }

  getWsPort(): number {
    return +(this.configService.get<string>('WS_PORT') || 3001);
  }

  getIp(): string {
    return this.configService.get<string>('IP') || '127.0.0.1';
  }

  getAllowedDomains(): string[] {
    return this.configService.get<string>('ALLOWED_DOMAINS')?.split(',') || [];
  }

  getWsApiUrl(): string {
    return this.configService.get<string>('WS_API_URL') || '';
  }

  getPingTimeout(): number {
    return +(this.configService.get<string>('PING_TIMEOUT') || 45000);
  }

  getPingInterval(): number {
    return +(this.configService.get<string>('PING_INTERVAL') || 20000);
  }
}
