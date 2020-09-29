import { Snowflake } from "discord.js";
import { Cacheable, CacheClear } from "@type-cacheable/core";
import { OnlyInstantiableByContainer, Singleton } from "typescript-ioc";
import { Transaction } from "sequelize";
import { GuildCreationAttributes } from "../database/models/Guild.model";
import SettingModel, {
  SettingCreationAttributes,
} from "../database/models/Setting.model";

export interface ISettingService {
  findOne(guildId: Snowflake, name: string): Promise<SettingModel | null>;

  create(data: SettingCreationAttributes): Promise<SettingModel>;

  findOneOrCreate(data: GuildCreationAttributes): Promise<SettingModel>;

  update(
    data: Partial<SettingCreationAttributes>,
    transaction?: Transaction
  ): Promise<number | SettingModel[] | undefined>;

  guildScoped(guildId: Snowflake);
}

@Singleton
@OnlyInstantiableByContainer
export default class SettingService implements ISettingService {
  @CacheClear({
    cacheKey: (args: any[]) => [`${args[0].name}`, `all-settings`],
    hashKey: (args) => args[0].guildId,
  })
  async update(
    data: Partial<SettingCreationAttributes>,
    transaction?: Transaction
  ) {
    return (
      await SettingModel.update(data, {
        where: {
          guildId: data.guildId,
          name: data.name,
        },
        transaction,
      })
    ).shift();
  }

  async create(data: SettingCreationAttributes) {
    return await SettingModel.create(data);
  }

  @Cacheable({
    cacheKey: (args) => `${args[0].name}`,
    hashKey: (args) => `${args[0].guildId}`,
    ttlSeconds: 86400,
  })
  async findOneOrCreate(data: SettingCreationAttributes) {
    const [m] = await SettingModel.findCreateFind({
      where: {
        guildId: data.guildId,
      },
      defaults: data,
    });
    return m;
  }

  @Cacheable({
    cacheKey: (args) => `${args[1]}`,
    hashKey: (args) => `${args[0]}`,
    ttlSeconds: 86400,
  })
  async findOne(
    guildId: Snowflake,
    name: string
  ): Promise<SettingModel | null> {
    return await SettingModel.findOne({
      where: {
        guildId,
        name,
      },
    });
  }

  @Cacheable({
    cacheKey: "all-settings",
    hashKey: (args) => args[0],
    ttlSeconds: 86400,
  })
  async guildScoped(guildId: Snowflake) {
    return SettingModel.scope({ method: ["guild", guildId] }).findAll();
  }
}
