declare module "mystbot" {
  import { Snowflake } from "discord.js";
  import {
    CommandContext,
    CommandOptions,
    ICommandPayload,
  } from "@sapphire/framework";

  export type UserId = Snowflake;
  export type GuildId = Snowflake;

  export type Experience = number;
  export type Level = number;

  export type Constructor<T = {}> = new (...args: any[]) => T;

  export type PermissionName = "ChangeSettings";
  export type TSettingName = keyof typeof SettingName;
  export enum SettingName {
    "Prefix" = 1,
    "StaffChannelId",
    "InfoChannelId",
  }

  export enum SettingValueTypes {
    "Prefix" = "string",
    "StaffChannelId" = "textChannel",
    "InfoChannelId" = "textChannel",
  }

  export type Category = "Economy" | "Guild" | "Misc" | "Admin" | "General";

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
    /**
     * Is how to use this command, for example: !cmd <@member> [number]
     * @default ''
     */
    usages?: string;
    /**
     * This command category
     */
    category?: Category;

    subcommands?: SubcommandOptions[];
  }
  export type SubcommandOptions = Omit<
    MystCommandOptions,
    "category" | "subcommands"
  >;

  export interface MystCommandContext extends CommandContext {
    /**
     * The subcommand options of this command
     */
    subcommand?: SubcommandOptions;
  }

  export interface MystCommandAcceptedPayload extends ICommandPayload {
    context: MystCommandContext;
    parameters: string;
  }

  export interface MystPreCommandRunPayload extends ICommandPayload {
    context: MystCommandContext;
    parameters: string;
  }
}

// For importing JSON files
declare module "*.json" {
  const value: any;
  export default value;
}
