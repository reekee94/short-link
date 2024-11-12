/**
 * Abstract class representing a generic storage service.
 * @template T The type of the entity to be stored.
 * @template ID The type of the entity's ID. Defaults to `unknown`.
 */
export abstract class Storage<T, ID = unknown> {
  /**
   * Creates a new entity in the storage.
   * @param data The entity to create.
   * @returns A promise that resolves to the created entity.
   */
  abstract create(data: unknown): Promise<T>;

  /**
   * Finds an entity by its ID.
   * @param id The ID of the entity to find.
   * @returns A promise that resolves to the found entity, or null if not found.
   */
  abstract findById(id: ID): Promise<T | null>;
}