import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import * as redisStore from 'cache-manager-redis-store';
import { AppLaunchConfig } from './configs';
import { HttpClientModule } from '../http-client';
import { ShortenerModule } from './shortener/shortener.module';
import { MongoModule } from '../db/mongo';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('REDIS_HOST', 'localhost'),
        port: configService.get('REDIS_PORT', 6379),
        ttl: 60, // in seconds
      }),
      inject: [ConfigService],
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    HttpClientModule,
    ShortenerModule,
    MongoModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },

    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    AppLaunchConfig,
  ],
})
export class AppModule {}
