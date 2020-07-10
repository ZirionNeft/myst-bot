import { ArgsOf, Client, Discord, On, Once } from "@typeit/discord";
import * as Path from "path";
import config from "../config/config.json";
import * as console from "console";
import * as process from "process";
import { Snowflake } from "discord.js";

export interface ServerDataItem {
  readonly snowflake: Snowflake;
  readonly name: string;
}

interface BotConfigKeys {
  channels: string;
  guild: string;
  roleMessages: string;
  roles: string;
}

export type BotConfig = Record<keyof BotConfigKeys, ServerDataItem[]>;

@Discord(process.env.COMMAND_PREFIX ?? "!", {
  import: [
    // replace extension with *.ts when the bot launch by ts-node,
    // otherwise *.js and Node launch
    Path.join(__dirname, "commands", "*.js"),
  ],
})
export class RgdBot {
  @Once("ready")
  ready() {
    console.log(Client.getCommands());
  }

  @On("message")
  onMessage([message]: ArgsOf<"message">, client: Client) {}

  static get config(): BotConfig {
    return config;
  }
}
