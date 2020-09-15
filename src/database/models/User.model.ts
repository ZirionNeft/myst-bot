import { DataTypes, ModelCtor, Optional, Sequelize } from "sequelize";
import { Snowflake } from "discord.js";
import { BaseModel } from "../BaseModel";

export interface UserAttributes {
  id: number;
  userId: Snowflake;
  guildId: Snowflake;
  coins: number;
  rouletteDate: Date | null;
  experience: number;
  level: number;
}

export interface UserCreationAttributes
  extends Optional<
    UserAttributes,
    "id" | "experience" | "level" | "coins" | "rouletteDate"
  > {}

export default class UserModel
  extends BaseModel<UserAttributes, UserCreationAttributes>
  implements UserAttributes {
  public static readonly ModelName: string = "User";
  public static readonly ModelNamePlural: string = "Users";
  public static readonly TableName: string = "users";

  id!: number;

  guildId!: Snowflake;
  userId!: Snowflake;
  coins!: number;
  rouletteDate!: Date | null;
  experience!: number;
  level!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static prepareInit(sequelize: Sequelize): void {
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
          unique: "compositeIndex",
        },
        userId: {
          type: new DataTypes.STRING(32),
          allowNull: false,
          unique: "compositeIndex",
        },
        coins: {
          type: new DataTypes.INTEGER(),
          allowNull: false,
          defaultValue: 0,
        },
        rouletteDate: {
          type: new DataTypes.DATE(),
          defaultValue: null,
        },
        level: {
          type: new DataTypes.INTEGER().UNSIGNED,
          defaultValue: 0,
        },
        experience: {
          type: new DataTypes.INTEGER().UNSIGNED,
          defaultValue: 0,
        },
      },
      {
        tableName: this.TableName,
        name: {
          singular: this.ModelName,
          plural: this.ModelNamePlural,
        },
        sequelize,
      }
    );
  }

  public static setAssociations(modelCtors: {
    [modelName: string]: ModelCtor<BaseModel>;
  }) {}

  public static setHooks(modelCtors: {
    [modelName: string]: ModelCtor<BaseModel>;
  }) {}
}
