import { Snowflake } from "discord.js";
import { Cacheable, CacheClear } from "@type-cacheable/core";
import { OnlyInstantiableByContainer, Singleton } from "typescript-ioc";
import { Transaction } from "sequelize";
import GuildModel, {
  GuildCreationAttributes,
} from "../database/models/Guild.model";

export interface IGuildService {
  findOne(id: Snowflake): Promise<GuildModel | null>;

  create(id: Snowflake, data?: GuildCreationAttributes): Promise<GuildModel>;

  findOneOrCreate(
    id: Snowflake,
    data?: GuildCreationAttributes
  ): Promise<GuildModel>;

  update(
    id: Snowflake,
    data: Omit<GuildCreationAttributes, "guildId">,
    transaction?: Transaction
  ): Promise<number | GuildModel[] | undefined>;
}

@Singleton
@OnlyInstantiableByContainer
export default class GuildService implements IGuildService {
  private _setCacheKey = (args: any[]) => args[0];

  @CacheClear({
    cacheKey: this._setCacheKey,
  })
  async update(
    id: Snowflake,
    data: Omit<GuildCreationAttributes, "guildId">,
    transaction?: Transaction
  ) {
    return (
      await GuildModel.update(data, {
        where: {
          guildId: id,
        },
        transaction,
      })
    ).shift();
  }

  async create(id: Snowflake, data?: GuildCreationAttributes) {
    return await GuildModel.create({
      ...{ guildId: id },
      ...data,
    });
  }

  @Cacheable({ cacheKey: this._setCacheKey, ttlSeconds: 60 })
  async findOneOrCreate(id: Snowflake, data?: GuildCreationAttributes) {
    const [m] = await GuildModel.findCreateFind({
      where: {
        guildId: id,
      },
      defaults: { ...data, guildId: id } as GuildCreationAttributes,
    });
    return m;
  }

  @Cacheable({ cacheKey: this._setCacheKey, ttlSeconds: 60 })
  async findOne(id: Snowflake): Promise<GuildModel | null> {
    return await GuildModel.findOne({
      where: {
        guildId: id,
      },
    });
  }
}
