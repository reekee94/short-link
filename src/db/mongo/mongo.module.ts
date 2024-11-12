import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConnectionConfig } from './configs/connection.config';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useClass: ConnectionConfig,
    }),
  ],
})
export class MongoModule {
}