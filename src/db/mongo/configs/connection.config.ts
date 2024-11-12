import { Injectable } from '@nestjs/common';
import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose/dist/interfaces/mongoose-options.interface';
import { ConfigService } from '@nestjs/config';

interface EnvironmentVariables {
  DB_MONGO_URI: string;
}

@Injectable()
export class ConnectionConfig implements MongooseOptionsFactory {
  readonly #db_mongo_uri: string;

  constructor(private configService: ConfigService<EnvironmentVariables>) {
    this.#db_mongo_uri = this.configService.get('DB_MONGO_URI');
  }

  createMongooseOptions(): MongooseModuleOptions {
    return {
      uri: this.#db_mongo_uri,
    };
  }

}