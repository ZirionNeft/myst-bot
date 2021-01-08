import { DataTypes, ModelCtor, Optional, Sequelize } from "sequelize";
import { Snowflake } from "discord.js";
import { BaseModel } from "../BaseModel";
import { GuildModel } from "./index";
import { PermissionName } from "../../structures/PermissionsManager";

export interface PermissionAttributes {
  id: number;
  guildId: Snowflake;
  roleId: Snowflake;
  permissionName: PermissionName;
}

export interface PermissionCreationAttributes
  extends Optional<PermissionAttributes, "id"> {}

export default class PermissionModel
  extends BaseModel<PermissionAttributes, PermissionCreationAttributes>
  implements PermissionAttributes {
  public static readonly ModelName: string = "Permission";
  public static readonly ModelNamePlural: string = "Permissions";
  public static readonly TableName: string = "permissions";

  id!: number;
  guildId!: Snowflake;
  roleId!: Snowflake;
  permissionName!: PermissionName;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static prepareInit(
    sequelize: Sequelize
  ): Promise<PermissionModel> | void {
    this.init(
      {
        id: {
          type: new DataTypes.INTEGER(),
          autoIncrement: true,
          primaryKey: true,
        },
        guildId: {
          type: new DataTypes.STRING(32),
          allowNull: false,
          references: {
            model: GuildModel.TableName,
            key: "guildId",
          },
        },
        roleId: {
          type: new DataTypes.STRING(32),
          allowNull: false,
        },
        permissionName: {
          type: new DataTypes.STRING(),
          allowNull: false,
        },
      },
      {
        tableName: this.TableName,
        name: {
          singular: this.ModelName,
          plural: this.ModelNamePlural,
        },
        scopes: {
          guild(guildId: Snowflake) {
            return {
              where: {
                guildId,
              },
            };
          },
          target(guildId: Snowflake, roleId: Snowflake) {
            return {
              where: {
                guildId,
                roleId,
              },
            };
          },
        },
        sequelize,
      }
    );
  }

  public static setHooks(modelCtors: {
    [modelName: string]: ModelCtor<BaseModel>;
  }) {}

  public static setAssociations(modelCtors: {
    [modelName: string]: ModelCtor<BaseModel>;
  }) {}
}
