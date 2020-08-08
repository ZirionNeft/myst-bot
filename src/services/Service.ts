import { Snowflake } from "discord.js";
import { Model, Transaction } from "sequelize";

export interface IService<T extends Model, K> {
  findOne(id: Snowflake): Promise<T | null>;

  create(id: Snowflake, data?: K): Promise<T>;

  findOneOrCreate(id: Snowflake, data?: K): Promise<T>;

  update(
    id: Snowflake,
    data: Partial<K>,
    transaction?: Transaction
  ): Promise<T | undefined>;
}

export class Service {
  // get first argument of target as a cache key
  static setCacheKey = (args: any[]) => args[0];
}
