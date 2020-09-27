import {
  Association,
  DataTypes,
  HasManyAddAssociationMixin,
  HasManyCountAssociationsMixin,
  HasManyCreateAssociationMixin,
  HasManyGetAssociationsMixin,
  HasManyHasAssociationMixin,
  ModelCtor,
  Optional,
  Sequelize,
} from "sequelize";
import { Snowflake } from "discord.js";
import UserModel from "./User.model";
import LoggerFactory from "../../utils/LoggerFactory";
import { BaseModel } from "../BaseModel";

export interface GuildAttributes {
  id: number;
  guildId: Snowflake;
  prefix: string;
  staffChannelId: Snowflake;
  infoChannelId: Snowflake;
}

export interface GuildCreationAttributes
  extends Optional<
    GuildAttributes,
    "id" | "prefix" | "staffChannelId" | "infoChannelId"
  > {}

export default class GuildModel
  extends BaseModel<GuildAttributes, GuildCreationAttributes>
  implements GuildAttributes {
  public static readonly ModelName: string = "Guild";
  public static readonly ModelNamePlural: string = "Guilds";
  public static readonly TableName: string = "guilds";

  id!: number;
  prefix!: string;
  guildId!: Snowflake;
  staffChannelId!: Snowflake;
  infoChannelId!: Snowflake;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public getUsers!: HasManyGetAssociationsMixin<UserModel>;
  public addUser!: HasManyAddAssociationMixin<UserModel, number>;
  public hasUser!: HasManyHasAssociationMixin<UserModel, number>;
  public countUsers!: HasManyCountAssociationsMixin;
  public createUser!: HasManyCreateAssociationMixin<UserModel>;

  public readonly users?: UserModel[];

  public static associations: {
    users: Association<GuildModel, UserModel>;
  };

  public static prepareInit(sequelize: Sequelize): Promise<GuildModel> | void {
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
          unique: true,
        },
        prefix: {
          type: new DataTypes.STRING(16),
          defaultValue: null,
        },
        staffChannelId: {
          type: new DataTypes.STRING(32),
          allowNull: true,
          defaultValue: null,
        },
        infoChannelId: {
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
        sequelize,
      }
    );
  }

  public static setHooks(modelCtors: {
    [modelName: string]: ModelCtor<BaseModel>;
  }) {
    this.addHook("afterCreate", (guild) =>
      LoggerFactory.get(GuildModel).info(
        `New Guild added in Database: <%s>`,
        guild.get().guildId
      )
    );
  }

  public static setAssociations(modelCtors: {
    [modelName: string]: ModelCtor<BaseModel>;
  }) {
    this.hasMany(UserModel, {
      sourceKey: "guildId",
      foreignKey: {
        name: "guildId",
        allowNull: false,
      },
      as: "users",
    });
  }
}
