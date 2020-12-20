declare module "mystbot" {
  import { Snowflake } from "discord.js";
  import { CommandOptions } from "@sapphire/framework";

  export type UserId = Snowflake;
  export type GuildId = Snowflake;

  export type Experience = number;
  export type Level = number;

  export type Constructor<T = {}> = new (...args: any[]) => T;

  export type PermissionName = "ChangeSettings";

  export enum Setting {
    "Prefix" = 0,
    "StaffChannelId" = 1,
    "InfoChannelId" = 2,
    "TEMPORARY" = 3,
  }

  export type SettingValueTypes = {
    [Setting.Prefix]: string;
    [Setting.StaffChannelId]: RawSnowflake;
    [Setting.InfoChannelId]: RawSnowflake;
    [Setting.TEMPORARY]: number; // TODO: Remove when a true number type will be added
  };

  export type RawSnowflake = Snowflake; // when snowflake is braced with discord chat construction <@123>
  export type SettingValueType<T extends Setting> = SettingValueTypes[T];
  export type Category = "Economy" | "Guild" | "Other" | "Admin";

  export type ExperienceBufferKey = Snowflake;
  export interface ExperienceDTO {
    experience: Experience;
    level: Level;
  }

  export interface BusinessEvents {
    levelUp: [UserId, GuildId, ExperienceDTO];
  }

  export type BusinessEvent = keyof BusinessEvents;

  export type BusinessEventArgs<K extends BusinessEvent> = BusinessEvents[K];
  export interface Emoji {
    name: string;
    id: Snowflake;
    animated?: boolean;
  }

  export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends Array<infer U>
      ? Array<DeepPartial<U>>
      : T[P] extends ReadonlyArray<infer U>
      ? ReadonlyArray<DeepPartial<U>>
      : DeepPartial<T[P]>;
  };

  export interface Subscriber<T extends BusinessEvent> {
    handle(args: BusinessEventArgs<T>);
  }

  export interface MystCommandOptions extends CommandOptions {
    usages?: string;
    category?: Category;
    coreCommand?: boolean;
  }
}

// For importing JSON files
declare module "*.json" {
  const value: any;
  export default value;
}
