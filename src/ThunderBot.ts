import {
  ArgsOf,
  Client,
  CommandMessage,
  Discord,
  ExpressionFunction,
  Guard,
  On,
  Once,
} from "@typeit/discord";
import * as Path from "path";
import config from "../config/config.json";
import * as console from "console";
import * as process from "process";
import { Snowflake } from "discord.js";
import { Database } from "./database/Database";
import { Models } from "./database/Models";
import { NotBot } from "./guards/NotBot";
import * as crypto from "crypto";
import Throttle from "./logic/Throttle";
import { Container } from "typescript-ioc";
import { ThrottleMessage } from "./guards/ThrottleMessage";

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
  const throttle: Throttle = Container.get(Throttle);
  if (message && (await throttle.hasTimer(message.author.id))) {
    // Sets fake prefix for prevent command processing if user message was throttled
    return crypto.randomBytes(2).toString("hex");
  }
  return DEFAULT_PREFIX;
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

  @On("message")
  @Guard(NotBot(), ThrottleMessage())
  onMessage([message]: ArgsOf<"message">, client: Client) {}

  static get config(): BotConfig {
    return config;
  }
}
