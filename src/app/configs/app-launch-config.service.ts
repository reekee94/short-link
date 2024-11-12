import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface EnvironmentVariables {
  APP_PORT: string;
}

@Injectable()
export class AppLaunchConfig {
  public readonly appPort;

  constructor(private configService: ConfigService<EnvironmentVariables>) {
    this.appPort = Number(this.configService.get('APP_PORT', { infer: true })) || 3000;
  }
}