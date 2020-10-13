import { Snowflake } from "discord.js";
import { Cacheable, CacheClear } from "@type-cacheable/core";
import { OnlyInstantiableByContainer, Singleton } from "typescript-ioc";
import Sequelize, { Transaction } from "sequelize";
import { GuildCreationAttributes } from "../database/models/Guild.model";
import PermissionModel, {
  PermissionAttributes,
  PermissionCreationAttributes,
} from "../database/models/Permission.model";

export interface IPermissionService {
  findOne(data: PermissionCreationAttributes): Promise<PermissionModel | null>;

  create(...models: PermissionCreationAttributes[]);

  findOneOrCreate(data: GuildCreationAttributes): Promise<PermissionModel>;

  delete(...models: PermissionAttributes[]): Promise<number>;

  guildScoped(guildId: Snowflake);
}

@Singleton
@OnlyInstantiableByContainer
export default class PermissionService implements IPermissionService {
  @CacheClear({
    cacheKey: (...args: any[]) => [
      ...args.map((m) => m.roleId),
      `guild-permissions`,
    ],
    hashKey: (args) => args[0].guildId,
  })
  async delete(...models: PermissionAttributes[]) {
    if (
      models.length > 1 &&
      !models.every((m) => m.guildId === models[0].guildId)
    ) {
      throw new Error(
        "Given models haven't the same guildId. Bulk destroying cancelled"
      );
    }
    return await PermissionModel.destroy({
      where: {
        id: models.map((m) => m.id),
      },
    });
  }

  async create(...models: PermissionCreationAttributes[]) {
    return await PermissionModel.bulkCreate(models);
  }

  async findOneOrCreate(data: PermissionCreationAttributes) {
    const [m] = await PermissionModel.findCreateFind({
      where: {
        guildId: data.guildId,
        roleId: data.roleId,
      },
      defaults: data,
    });
    return m;
  }

  async findOne(
    data: PermissionCreationAttributes
  ): Promise<PermissionModel | null> {
    return await PermissionModel.findOne({
      where: {
        ...data,
      },
    });
  }

  @Cacheable({
    cacheKey: "guild-permissions",
    hashKey: (args) => args[0],
    ttlSeconds: 86400,
  })
  async guildScoped(guildId: Snowflake) {
    return PermissionModel.scope({ method: ["guild", guildId] }).findAll();
  }

  @Cacheable({
    cacheKey: (args) => `${args[1]}`,
    hashKey: (args) => args[0],
    ttlSeconds: 86400,
  })
  async getRoleAll(guildId: Snowflake, roleId: Snowflake) {
    return PermissionModel.scope({
      method: ["target", guildId, roleId],
    }).findAll();
  }
}
