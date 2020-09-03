// For importing JSON files
import { Snowflake } from "discord.js";
import EmojiModel from "./database/models/Emoji.model";

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

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : DeepPartial<T[P]>;
};
