import {
  Client,
  CommandMessage,
  Discord,
  ExpressionFunction,
  Once,
  Rule,
} from "@typeit/discord";
import * as Path from "path";
import config from "../config/config.json";
import * as console from "console";
import * as process from "process";
import { Snowflake } from "discord.js";
import { Database } from "./database/Database";
import { Models } from "./database/Models";

export interface ServerDataItem {
  readonly value: Snowflake | string;
  readonly name: string;
}

interface BotConfigKeys {
  channels: string;
  roleMessages: string;
  roles: string;
  icons: string;
  stuffRoles: string;
}

export type BotConfig = Record<keyof BotConfigKeys, ServerDataItem[]>;

const DEFAULT_PREFIX = process.env.COMMAND_PREFIX ?? "!";

const prefixBehaviour: ExpressionFunction = async (
  message?: CommandMessage,
  client?: Client
) => {
  return Rule().startWith("(?:!|testPrefix)"); //DEFAULT_PREFIX;
};

@Discord(prefixBehaviour, {
  import: [
    // replace extension with *.ts when the bot launch by ts-node,
    // otherwise *.js and Node launch
    Path.join(__dirname, "commands", "*.js"),
  ],
})
export class ThunderBot {
  @Once("ready")
  ready() {
    Database.init()
      .then((v): void => {
        console.info(`${v.getDialect()}: Database successfully connected!`);

        Models.init(v).then((): void => {
          console.info("All models successfully synchronised!");
        });
      })
      .catch((e: Error): void => console.error("Database init error\n" + e));

    console.log(Client.getCommands());
  }

  // @On("message")
  // onMessage([message]: ArgsOf<"message">, client: Client) {}

  static get config(): BotConfig {
    return config;
  }
}
