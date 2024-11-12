/**
 * Abstract class representing a generic MongoDB storage service.
 * @template T The type of the entity to be stored.
 */
import { Storage } from '../storage';
import { MongoEntity } from './mongo-entity.schema';

export abstract class MongoStorage<T extends MongoEntity> extends Storage<T, string> {
}