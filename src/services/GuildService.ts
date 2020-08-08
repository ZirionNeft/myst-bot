import { Snowflake } from "discord.js";
import { Cacheable } from "@type-cacheable/core";
import User, { UserCreationAttributes } from "../database/models/User";
import { OnlyInstantiableByContainer, Singleton } from "typescript-ioc";
import { Op, Transaction } from "sequelize";
import Guild, { GuildCreationAttributes } from "../database/models/Guild";
import { IService, Service } from "./Service";

export interface IGuildService
  extends IService<Guild, GuildCreationAttributes> {}

@Singleton
@OnlyInstantiableByContainer
export default class GuildService extends Service implements IGuildService {
  async update(
    id: Snowflake,
    data: Partial<GuildCreationAttributes>,
    transaction?: Transaction
  ) {
    return (await this.findOne(id))?.update(data, { transaction });
  }

  async create(id: Snowflake, data?: GuildCreationAttributes) {
    return await Guild.create({
      ...{ guildId: id },
      ...data,
    });
  }

  async findOneOrCreate(id: Snowflake, data?: GuildCreationAttributes) {
    return (await this.findOne(id)) ?? (await this.create(id, data));
  }

  @Cacheable({ cacheKey: GuildService.setCacheKey, ttlSeconds: 15 })
  async findOne(id: Snowflake): Promise<Guild | null> {
    return await Guild.findOne({
      where: {
        guildId: id,
      },
    });
  }
}
