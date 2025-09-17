export interface IBaseRepository<T, K> {
  findById(id: K): Promise<T | null>;
  save(entity: T): Promise<T>;
  delete(id: K): Promise<void>;
}

export interface IQueryableRepository<T> {
  findAll(): Promise<T[]>;
  findBy(criteria: Record<string, any>): Promise<T[]>;
}