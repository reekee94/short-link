import { Document, Types } from 'mongoose';
import { Prop } from '@nestjs/mongoose';

export interface IMongoEntity {
  _id: Types.ObjectId;
  createdAt: Date;
}

export class MongoEntity extends Document implements IMongoEntity {
  @Prop({ type: Types.ObjectId, default: () => new Types.ObjectId() })
  _id: Types.ObjectId;

  @Prop({ default: () => new Date(), type: Date })
  createdAt: Date;
}