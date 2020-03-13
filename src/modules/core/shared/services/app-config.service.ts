import { readFileSync } from 'fs';
import { resolve as resolvePath } from 'path';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { parse as parseEnv } from 'dotenv';

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}

  static constructFromEnvFile(envFileName: string = '.env'): AppConfigService {
    const envFileContent = readFileSync(resolvePath(process.cwd(), envFileName));
    const parsedEnv = parseEnv(envFileContent);
    const configService = new ConfigService(parsedEnv);

    return new AppConfigService(configService);
  }

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
}
