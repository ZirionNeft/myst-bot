import {
  Association,
  HasManyAddAssociationMixin,
  HasManyCountAssociationsMixin,
  HasManyCreateAssociationMixin,
  HasManyGetAssociationsMixin,
  HasManyHasAssociationMixin,
  Model,
  Optional,
} from "sequelize";
import { Snowflake } from "discord.js";
import User from "./User";

export interface GuildAttributes {
  id: number;
  guildId: Snowflake;
  prefix: string;
}

export interface GuildCreationAttributes
  extends Optional<GuildAttributes, "id" | "prefix"> {}

export default class Guild
  extends Model<GuildAttributes, GuildCreationAttributes>
  implements GuildAttributes {
  id!: number;
  prefix!: string;
  guildId!: Snowflake;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public getUsers!: HasManyGetAssociationsMixin<User>;
  public addUser!: HasManyAddAssociationMixin<User, number>;
  public hasUser!: HasManyHasAssociationMixin<User, number>;
  public countUsers!: HasManyCountAssociationsMixin;
  public createUser!: HasManyCreateAssociationMixin<User>;

  public readonly users?: User[];

  public static associations: {
    users: Association<Guild, User>;
  };
}
