// For importing JSON files
import { Snowflake } from "discord.js";
import Emoji from "./database/models/Emoji";

declare module "*.json" {
  const value: any;
  export default value;
}

export interface EmojiData {
  name: string;
  id: Snowflake;
  animated?: boolean;
}

export interface GuardData {
  emojis: EmojiData[];
}
