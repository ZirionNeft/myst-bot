import {
  ArgsOf,
  Client,
  CommandMessage,
  Discord,
  Guard,
  On,
  Once,
  Rule,
} from "@typeit/discord";
import * as Path from "path";
import { Snowflake } from "discord.js";
import { getDatabase, TDatabase } from "./database/Database";
import { Inject } from "typescript-ioc";
import GuildService from "./services/GuildService";
import { MessageHelpers } from "./utils/MessageHelpers";
import BotHelpers from "./utils/BotHelpers";
import { EmojiScanner } from "./middlewares/EmojiScanner";
import { GuardDataArgs } from "mystbot";
import EmojiCountManager from "./logic/EmojiCountManager";
import LoggerFactory from "./utils/LoggerFactory";
import LevelingManager from "./logic/LevelingManager";

const prefixBehaviour = async (message?: CommandMessage, client?: Client) => {
  return Rule().startWith(
    `(?:${await BotHelpers.getGuildPrefix(message?.guild?.id)}|<\@\!${
      MystBot.clientId
    }> )`
  );
};

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

  @Inject
  private _levelingManager!: LevelingManager;

  private static _clientId?: Snowflake;

  private static _database: TDatabase;

  static get clientId(): Snowflake | undefined {
    return MystBot._clientId;
  }

  static get database() {
    return this._database;
  }

  @Once("ready")
  async ready([]: ArgsOf<"ready">, client: Client) {
    MystBot._clientId = client.user?.id;

    MystBot._database = await getDatabase();
    LoggerFactory.get(MystBot).info(">>> Bot successfully started up!");
  }

  @On("guildCreate")
  async onGuildCreate([guild]: ArgsOf<"guildCreate">, client: Client) {
    try {
      await this._guildService.findOneOrCreate(guild.id);
    } catch (e) {
      LoggerFactory.get(MystBot).error(e);
      guild.owner ? await MessageHelpers.sendSystemErrorDM(guild.owner) : null;
    }
  }

  @On("message")
  @Guard(EmojiScanner())
  async onMessage(
    [message]: ArgsOf<"message">,
    client: Client,
    { emojis: [emojis] }: GuardDataArgs<"emojis">
  ) {
    try {
      if (message.guild?.id && emojis?.length) {
        const guildId = message.guild.id;
        this._emojiCountManager
          .add(
            ...emojis.map((e) => ({
              guildId,
              emojiId: e.id,
              name: e.name,
            }))
          )
          .then((l) =>
            LoggerFactory.get(MystBot).info(`Emojis accumulated: ${l}`)
          );
      }
    } catch (e) {
      LoggerFactory.get(MystBot).error("Emoji counter error!");
      LoggerFactory.get(MystBot).error(e);
    }

    try {
      if (message.guild?.id && !message.author.bot) {
        this._levelingManager
          .resolve(message)
          .then((v) =>
            LoggerFactory.get(MystBot).debug(
              `<${message.guild?.id}> Leveling System - XP: ${
                v?.experience ?? -1
              } Level: ${v?.level ?? -1}`
            )
          );
      }
    } catch (e) {
      LoggerFactory.get(MystBot).error("Leveling system error!");
      LoggerFactory.get(MystBot).error(e);
    }
  }
}
