import { Model, Optional } from "sequelize";
import { Snowflake } from "discord.js";
import { Literal } from "sequelize/types/lib/utils";

export interface EmojiAttributes {
  id: number;
  name: string;
  guildId: Snowflake;
  emojiId: Snowflake;
  counter: number;
}

export interface EmojiCreationAttributes
  extends Optional<EmojiAttributes, "id" | "name" | "counter"> {}

export default class Emoji
  extends Model<EmojiAttributes, EmojiCreationAttributes>
  implements EmojiAttributes {
  id!: number;
  name!: string;
  emojiId!: Snowflake;
  guildId!: Snowflake;
  counter!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}
