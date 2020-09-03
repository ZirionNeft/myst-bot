import { Snowflake } from "discord.js";
import { Cacheable, CacheClear } from "@type-cacheable/core";
import UserModel, {
  UserCreationAttributes,
} from "../database/models/User.model";
import { OnlyInstantiableByContainer, Singleton } from "typescript-ioc";
import { Op, Transaction } from "sequelize";

export interface IUserService {
  getAllPositiveCoins(guildId: Snowflake): Promise<UserModel[]>;

  update(
    id: Snowflake,
    guildDataId: Snowflake,
    data: Omit<UserCreationAttributes, "guildId" | "userId">,
    transaction?: Transaction
  ): Promise<number | UserModel[] | undefined>;

  create(
    userId: Snowflake,
    guildId: Snowflake,
    data?: UserCreationAttributes
  ): Promise<UserModel | undefined>;

  findOne(userId: Snowflake, guildId: Snowflake): Promise<UserModel | null>;

  findOneOrCreate(
    userId: Snowflake,
    guildId: Snowflake,
    data?: UserCreationAttributes
  ): Promise<UserModel>;
}

@Singleton
@OnlyInstantiableByContainer
export default class UserService implements IUserService {
  private _userCacheKey = (args: any[]) => `${args[0]}:${args[1]}`;
  private _allPositiveCoinsCacheKey = (args: any[]) => args[0];

  @CacheClear({
    cacheKey: this._userCacheKey,
  })
  async update(
    userId: Snowflake,
    guildId: Snowflake,
    data: Omit<UserCreationAttributes, "guildId" | "userId">,
    transaction?: Transaction
  ) {
    return (
      await UserModel.update(data, {
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
    return UserModel.create({
      ...{ userId, guildId },
      ...data,
    });
  }

  @Cacheable({
    cacheKey: this._userCacheKey,
    ttlSeconds: 60,
  })
  async findOneOrCreate(
    userId: Snowflake,
    guildId: Snowflake,
    data?: UserCreationAttributes
  ) {
    const [m] = await UserModel.findCreateFind({
      where: {
        [Op.and]: {
          userId,
          guildId,
        },
      },
      defaults: { ...data, guildId, userId } as UserCreationAttributes,
    });

    return m;
  }

  @Cacheable({
    cacheKey: this._userCacheKey,
    ttlSeconds: 60,
  })
  async findOne(
    userId: Snowflake,
    guildId: Snowflake
  ): Promise<UserModel | null> {
    return await UserModel.findOne({
      where: {
        [Op.and]: {
          userId,
          guildId,
        },
      },
    });
  }

  @Cacheable({
    cacheKey: this._allPositiveCoinsCacheKey,
    hashKey: "all-positive-coins",
    ttlSeconds: 60,
  })
  async getAllPositiveCoins(guildId: Snowflake): Promise<UserModel[]> {
    return UserModel.findAll({
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
