import { DataTypes, ModelCtor, Optional, Sequelize } from "sequelize";
import { Snowflake } from "discord.js";
import { BaseModel } from "../BaseModel";
import { Setting } from "mystbot";

export interface SettingAttributes {
  id: number;
  guildId: Snowflake;
  name: Setting;
  value: Snowflake;
}

export interface SettingCreationAttributes
  extends Optional<SettingAttributes, "id" | "value"> {}

export default class SettingModel
  extends BaseModel<SettingAttributes, SettingCreationAttributes>
  implements SettingAttributes {
  public static readonly ModelName: string = "Setting";
  public static readonly ModelNamePlural: string = "Settings";
  public static readonly TableName: string = "settings";

  id!: number;
  guildId!: Snowflake;
  name!: Setting;
  value!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static prepareInit(
    sequelize: Sequelize
  ): Promise<SettingModel> | void {
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
        },
        name: {
          type: new DataTypes.STRING(32),
          allowNull: false,
        },
        value: {
          type: new DataTypes.STRING(32),
          allowNull: true,
          defaultValue: null,
        },
      },
      {
        tableName: this.TableName,
        name: {
          singular: this.ModelName,
          plural: this.ModelNamePlural,
        },
        scopes: {
          guild(id) {
            return {
              where: {
                guildId: id,
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
