import { Snowflake } from "discord.js";
import { Cacheable, CacheClear } from "@type-cacheable/core";
import { OnlyInstantiableByContainer, Singleton } from "typescript-ioc";
import { Transaction } from "sequelize";
import Guild, { GuildCreationAttributes } from "../database/models/Guild";

export interface IGuildService {
  findOne(id: Snowflake): Promise<Guild | null>;

  create(id: Snowflake, data?: GuildCreationAttributes): Promise<Guild>;

  findOneOrCreate(
    id: Snowflake,
    data?: GuildCreationAttributes
  ): Promise<Guild>;

  update(
    id: Snowflake,
    data: Partial<GuildCreationAttributes>,
    transaction?: Transaction
  ): Promise<number | Guild[] | undefined>;
}

@Singleton
@OnlyInstantiableByContainer
export default class GuildService implements IGuildService {
  static setCacheKey = (args: any[]) => args[0];

  @CacheClear({
    cacheKey: GuildService.setCacheKey,
  })
  async update(
    id: Snowflake,
    data: Omit<GuildCreationAttributes, "guildId">,
    transaction?: Transaction
  ) {
    return (
      await Guild.update(data, {
        where: {
          guildId: id,
        },
        transaction,
      })
    ).shift();
  }

  async create(id: Snowflake, data?: GuildCreationAttributes) {
    return await Guild.create({
      ...{ guildId: id },
      ...data,
    });
  }

  @Cacheable({ cacheKey: GuildService.setCacheKey, ttlSeconds: 60 })
  async findOneOrCreate(id: Snowflake, data?: GuildCreationAttributes) {
    const [m] = await Guild.findCreateFind({
      where: {
        guildId: id,
      },
      defaults: data,
    });
    return m;
  }

  @Cacheable({ cacheKey: GuildService.setCacheKey, ttlSeconds: 60 })
  async findOne(id: Snowflake): Promise<Guild | null> {
    return await Guild.findOne({
      where: {
        guildId: id,
      },
    });
  }
}
