import {
  ArgsOf,
  Client,
  CommandMessage,
  Discord,
  ExpressionFunction,
  Guard,
  On,
  Once,
  Rule,
} from "@typeit/discord";
import * as Path from "path";
import * as console from "console";
import { MessageEmbed, Snowflake } from "discord.js";
import { Database } from "./database/Database";
import { Models } from "./database/Models";
import { Inject } from "typescript-ioc";
import GuildService from "./services/GuildService";
import { MessageHelpers } from "./utils/MessageHelpers";
import BotHelpers from "./utils/BotHelpers";
import { EmojiScanner } from "./middlewares/EmojiScanner";
import { GuardData } from "./globals";
import EmojiCountManager from "./logic/EmojiCountManager";
import Emoji from "./database/models/Emoji";

const prefixBehaviour = async (message?: CommandMessage, client?: Client) => {
  return Rule().startWith(
    `(?:${await BotHelpers.getGuildPrefix(message?.guild?.id)}|<\@\!${
      MystBot.clientId
    }> )`
  );
};

// TODO "Currently bot is in calibrating mod" feature
// TODO: coins multiplier
// TODO: user impact in server (exp); server level, server top; server oriented leveling and exp;

@Discord(prefixBehaviour, {
  import: [
    // replace extension with *.ts when the bot launch by ts-node,
    // otherwise *.js and Node launch
    Path.join(__dirname, "commands", "*.js"),
  ],
})
export class MystBot {
  @Inject
  private _guildService!: GuildService;

  @Inject
  private _emojiCountManager!: EmojiCountManager;

  private static _clientId?: Snowflake;

  static get clientId(): Snowflake | undefined {
    return MystBot._clientId;
  }

  @Once("ready")
  ready([]: ArgsOf<"ready">, client: Client) {
    MystBot._clientId = client.user?.id;

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
      await this._guildService.findOneOrCreate(guild.id);
    } catch (e) {
      console.error(e);
      guild.owner ? await MessageHelpers.sendSystemErrorDM(guild.owner) : null;
    }
  }

  @On("message")
  @Guard(EmojiScanner())
  async onMessage(
    [message]: ArgsOf<"message">,
    client: Client,
    guardData: GuardData
  ) {
    try {
      if (message.guild?.id && guardData.emojis.length) {
        const gId = message.guild.id;
        this._emojiCountManager
          .add(
            ...guardData.emojis.map((e) => ({
              guildId: gId,
              emojiId: e.id,
              name: e.name,
            }))
          )
          .then((l) => console.info(`Emojis accumulated: ${l}`));
      }
    } catch (e) {
      console.error(e);
    }
  }
}
