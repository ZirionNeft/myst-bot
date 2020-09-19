declare module "mystbot" {
  import { Snowflake } from "discord.js";

  export type UserId = Snowflake;
  export type GuildId = Snowflake;

  export type Experience = number;
  export type Level = number;

  export type ExperienceBufferKey = string;
  export interface ExperienceDTO {
    experience: Experience;
    level: Level;
  }

  export interface BusinessEvents {
    levelUp: [UserId, GuildId, ExperienceDTO];
  }

  export type BusinessEvent = keyof BusinessEvents;

  export interface GuardData {
    emojis: [Emoji[]];
  }

  export type BusinessEventArgs<K extends BusinessEvent> = BusinessEvents[K];
  export type GuardDataArgs<K extends keyof GuardData> = {
    [key in keyof GuardData]: GuardData[K];
  };

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
}

// For importing JSON files
declare module "*.json" {
  const value: any;
  export default value;
}
