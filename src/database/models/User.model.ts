import { DataTypes, ModelCtor, Optional, Sequelize } from "sequelize";
import { Snowflake } from "discord.js";
import { BaseModel } from "../BaseModel";

interface UserAttributes {
  id: number;
  userId: Snowflake;
  guildId: Snowflake;
  coins: number;
  rouletteDate: Date | null;
}

export interface UserCreationAttributes
  extends Optional<UserAttributes, "id" | "coins" | "rouletteDate"> {}

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
        },
        userId: {
          type: new DataTypes.STRING(32),
          allowNull: false,
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
      },
      {
        tableName: this.TableName,
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
