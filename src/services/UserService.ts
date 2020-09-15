import { Snowflake } from "discord.js";
import { Cacheable, CacheClear } from "@type-cacheable/core";
import UserModel, {
  UserAttributes,
  UserCreationAttributes,
} from "../database/models/User.model";
import { OnlyInstantiableByContainer, Singleton } from "typescript-ioc";
import { Op, Transaction } from "sequelize";
import Logger from "../utils/Logger";

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

const CACHE_BUILDER = (args: any[]) => `${args[0]}:${args[1]}`;
const BULK_CACHE_BUILDER = (models: any[]) =>
  (models as UserAttributes[]).map(
    ({ userId, guildId }) => `${userId}:${guildId}`
  );

@Singleton
@OnlyInstantiableByContainer
export default class UserService implements IUserService {
  private static _logger = Logger.get(UserService);

  @CacheClear({
    cacheKey: CACHE_BUILDER,
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
    cacheKey: CACHE_BUILDER,
    ttlSeconds: 60,
  })
  async findOneOrCreate(
    userId: Snowflake,
    guildId: Snowflake,
    data?: UserCreationAttributes
  ) {
    const [m] = await UserModel.findOrCreate({
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
    cacheKey: CACHE_BUILDER,
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

  @CacheClear({
    cacheKey: BULK_CACHE_BUILDER,
  })
  async bulkUpdateOrCreate(...models: UserCreationAttributes[]) {
    return await UserModel.bulkCreate(models, {
      updateOnDuplicate: ["experience", "level"],
      fields: ["guildId", "userId", "experience", "level"], // Fields to insert
    });
  }

  @Cacheable({
    cacheKey: (args: any[]) => args[0],
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
