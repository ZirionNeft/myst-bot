import { Snowflake } from "discord.js";
import { Cacheable, CacheClear } from "@type-cacheable/core";
import User, { UserCreationAttributes } from "../database/models/User";
import { OnlyInstantiableByContainer, Singleton } from "typescript-ioc";
import { Op, Transaction } from "sequelize";

export interface IUserService {
  getAllPositiveCoins(guildId: Snowflake): Promise<User[]>;

  update(
    id: Snowflake,
    guildDataId: Snowflake,
    data: Omit<UserCreationAttributes, "guildId" | "userId">,
    transaction?: Transaction
  ): Promise<number | User[] | undefined>;

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
export default class UserService implements IUserService {
  static userCacheKey = (args: any[]) => `${args[0]}:${args[1]}`;
  static allPositiveCoinsCacheKey = (args: any[]) => args[0];

  @CacheClear({
    cacheKey: UserService.userCacheKey,
  })
  async update(
    userId: Snowflake,
    guildId: Snowflake,
    data: Omit<UserCreationAttributes, "guildId" | "userId">,
    transaction?: Transaction
  ) {
    return (
      await User.update(data, {
        where: {
          [Op.and]: {
            guildId,
            userId,
          },
        },
        transaction,
      })
    ).shift();
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

  @Cacheable({
    cacheKey: UserService.userCacheKey,
    ttlSeconds: 60,
  })
  async findOneOrCreate(
    userId: Snowflake,
    guildId: Snowflake,
    data?: UserCreationAttributes
  ) {
    const [m] = await User.findCreateFind({
      where: {
        [Op.and]: {
          userId,
          guildId,
        },
      },
      defaults: data,
    });

    return m;
  }

  @Cacheable({
    cacheKey: UserService.userCacheKey,
    ttlSeconds: 60,
  })
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

  @Cacheable({
    cacheKey: UserService.allPositiveCoinsCacheKey,
    hashKey: "all-positive-coins",
    ttlSeconds: 60,
  })
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
