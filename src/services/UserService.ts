import { Snowflake } from "discord.js";
import { Cacheable } from "@type-cacheable/core";
import User, { UserCreationAttributes } from "../database/models/User";
import { OnlyInstantiableByContainer, Singleton } from "typescript-ioc";
import { Op, Transaction } from "sequelize";
import { Service } from "./Service";

export interface IUserService {
  getAllPositiveCoins(guildId: Snowflake): Promise<User[]>;

  update(
    id: Snowflake,
    guildDataId: Snowflake,
    data: Partial<UserCreationAttributes>,
    transaction?: Transaction
  ): Promise<User | undefined>;

  create(
    userId: Snowflake,
    guildId: Snowflake,
    data?: UserCreationAttributes
  ): Promise<User | undefined>;

  findOne(userId: Snowflake, guildId: Snowflake): Promise<User | null>;

  findOneOrCreate(
    userId: Snowflake,
    guildId: Snowflake,
    data?: UserCreationAttributes
  ): Promise<User>;
}

@Singleton
@OnlyInstantiableByContainer
export default class UserService extends Service implements IUserService {
  static setCacheKey = (args: any[]) => `${args[0]}:${args[1]}`;
  static allPositiveCoinsCacheKey = (args: any[]) =>
    `all-positive-coins:${args[0]}`;

  async update(
    userId: Snowflake,
    guildId: Snowflake,
    data: Partial<UserCreationAttributes>,
    transaction?: Transaction
  ) {
    return (await this.findOne(userId, guildId))?.update(data, { transaction });
  }

  async create(
    userId: Snowflake,
    guildId: Snowflake,
    data?: UserCreationAttributes
  ) {
    return User.create({
      ...{ userId, guildId },
      ...data,
    });
  }

  async findOneOrCreate(
    userId: Snowflake,
    guildId: Snowflake,
    data?: UserCreationAttributes
  ) {
    return (
      (await this.findOne(userId, guildId)) ??
      (await this.create(userId, guildId, data))
    );
  }

  @Cacheable({ cacheKey: UserService.setCacheKey, ttlSeconds: 15 })
  async findOne(userId: Snowflake, guildId: Snowflake): Promise<User | null> {
    return await User.findOne({
      where: {
        [Op.and]: {
          userId,
          guildId,
        },
      },
    });
  }

  @Cacheable({ cacheKey: UserService.allPositiveCoinsCacheKey, ttlSeconds: 30 })
  async getAllPositiveCoins(guildId: Snowflake): Promise<User[]> {
    return User.findAll({
      where: {
        [Op.and]: {
          coins: {
            [Op.gt]: 0,
          },
          guildId,
        },
      },
      order: [["coins", "DESC"]],
    });
  }
}
