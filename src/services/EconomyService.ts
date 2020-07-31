import { Snowflake } from "discord.js";
import { Cacheable } from "@type-cacheable/core";
import Economy from "../database/models/economy";
import { OnlyInstantiableByContainer, Singleton } from "typescript-ioc";
import { Op } from "sequelize";

export interface IEconomyService {
  getUser: (id: Snowflake) => Promise<Economy | null>;
}

@Singleton
@OnlyInstantiableByContainer
export default class EconomyService implements IEconomyService {
  // get first argument of target as a cache key
  static setCacheKey = (args: any[]) => args[0];

  @Cacheable({ cacheKey: EconomyService.setCacheKey, ttlSeconds: 15 })
  async getUser(id: Snowflake): Promise<Economy | null> {
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
