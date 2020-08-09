import {
  ArgsOf,
  Client,
  CommandMessage,
  Discord,
  ExpressionFunction,
  On,
  Once,
  Rule,
} from "@typeit/discord";
import * as Path from "path";
import config from "../config/config.json";
import * as console from "console";
import { Snowflake } from "discord.js";
import { Database } from "./database/Database";
import { Models } from "./database/Models";
import { Inject } from "typescript-ioc";
import GuildService from "./services/GuildService";
import { Utils } from "./Utils";

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

const prefixBehaviour: ExpressionFunction = async (
  message?: CommandMessage,
  client?: Client
) => {
  return Rule().startWith(await Utils.getGuildPrefix(message?.guild?.id)); //DEFAULT_PREFIX;
};

// TODO: InGuildOnly guard
// TODO: NotBotMention guard
// TODO "Currently bot is in calibrating mod" feature

@Discord(prefixBehaviour, {
  import: [
    // replace extension with *.ts when the bot launch by ts-node,
    // otherwise *.js and Node launch
    Path.join(__dirname, "commands", "*.js"),
  ],
})
export class MystBot {
  @Inject
  private guildService!: GuildService;

  @Once("ready")
  ready() {
    Database.init()
      .then((v): void => {
        console.info(`${v.getDialect()}: Database is successfully connected!`);

        Models.init(v).then((): void => {
          console.info("All models are successfully synchronised!");
        });
      })
      .catch((e: Error): void => console.error("Database init error\n" + e));

    console.log(Client.getCommands());
  }

  @On("guildCreate")
  async onGuildCreate([guild]: ArgsOf<"guildCreate">, client: Client) {
    try {
      await this.guildService.findOneOrCreate(guild.id);
    } catch (e) {
      console.error(e);
      guild.owner ? await Utils.sendSystemErrorDM(guild.owner) : null;
    }
  }

  // @On("message")
  // onMessage([message]: ArgsOf<"message">, client: Client) {}
  static get config(): BotConfig {
    return config;
  }
}
