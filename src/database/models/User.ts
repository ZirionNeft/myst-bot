import { Model, Optional } from "sequelize";
import { Snowflake } from "discord.js";

interface UserAttributes {
  id: number;
  userId: Snowflake;
  guildId: Snowflake;
  coins: number;
  rouletteDate: Date | null;
}

export interface UserCreationAttributes
  extends Optional<UserAttributes, "id" | "coins" | "rouletteDate"> {}

export default class User extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes {
  id!: number;
  guildId!: Snowflake;
  userId!: Snowflake;
  coins!: number;
  rouletteDate!: Date | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}
