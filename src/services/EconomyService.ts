import { Snowflake } from "discord.js";
import { Cacheable } from "@type-cacheable/core";
import Economy, { EconomyCreationAttributes } from "../database/models/economy";
import { OnlyInstantiableByContainer, Singleton } from "typescript-ioc";
import { Op, Transaction } from "sequelize";

export interface IEconomyService {
  findOne(id: Snowflake): Promise<Economy | null>;
  create(userId: Snowflake, data?: EconomyCreationAttributes): Promise<Economy>;
  getAllPositiveCoins(): Promise<Economy[]>;
  findOneOrCreate(
    userId: Snowflake,
    data?: EconomyCreationAttributes
  ): Promise<Economy>;
  update(
    user: Economy | Snowflake,
    data: EconomyCreationAttributes,
    transaction?: Transaction
  ): Promise<Economy | undefined>;
}

@Singleton
@OnlyInstantiableByContainer
export default class EconomyService implements IEconomyService {
  // get first argument of target as a cache key
  static setCacheKey = (args: any[]) => args[0];

  async update(
    user: Economy | Snowflake,
    data: EconomyCreationAttributes,
    transaction?: Transaction
  ) {
    return (await user) instanceof Economy
      ? (user as Economy).update(data, { transaction })
      : (await this.findOne(user as Snowflake))?.update(data, { transaction });
  }

  async create(userId: Snowflake, data?: EconomyCreationAttributes) {
    return await Economy.create({
      ...{ memberSnowflake: userId },
      ...data,
    });
  }

  async findOneOrCreate(userId: Snowflake, data?: EconomyCreationAttributes) {
    return (await this.findOne(userId)) ?? (await this.create(userId, data));
  }

  @Cacheable({ cacheKey: EconomyService.setCacheKey, ttlSeconds: 15 })
  async findOne(id: Snowflake): Promise<Economy | null> {
    return await Economy.findOne({
      where: {
        memberSnowflake: id,
      },
    });
  }

  @Cacheable({ cacheKey: "all-positive-coins", ttlSeconds: 15 })
  async getAllPositiveCoins(): Promise<Economy[]> {
    return Economy.findAll({
      where: {
        coins: {
          [Op.gt]: 0,
        },
      },
      order: [["coins", "DESC"]],
    });
  }
}
