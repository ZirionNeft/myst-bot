import { ApplyOptions } from "@sapphire/decorators";
import { Event, EventOptions, Events } from "@sapphire/framework";
import LoggerFactory from "../lib/utils/LoggerFactory";
import { MystBotClient } from "../lib/MystBotClient";
import { StringHelpers } from "../lib/utils/StringHelpers";
import { Message, Snowflake } from "discord.js";
import EmojiCountManager from "../lib/structures/EmojiCountManager";
import { Inject } from "typescript-ioc";
import LevelingManager from "../lib/structures/LevelingManager";

export interface EmojiCounterDTO {
  name: string;
  id: Snowflake;
  animated?: boolean;
}

@ApplyOptions<EventOptions>({ once: true })
export class UserEvent extends Event<Events.Message> {
  @Inject
  private _emojiCountManager!: EmojiCountManager;

  @Inject
  private _levelingManager!: LevelingManager;

  // TODO: Make async?
  public run(message: Message) {
    this._handleEmojis(message);
    this._handleLeveling(message);
  }

  // TODO: move to another structure
  private _handleEmojis(message: Message) {
    const emojis = (message.content.match(/<a:.+?:\d+>|<:.+?:\d+>/g) || []).map(
      (e) => StringHelpers.getEmojiDataFromString(e) as EmojiCounterDTO
    );

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
            LoggerFactory.get(MystBotClient).info(`Emojis accumulated: ${l}`)
          );
      }
    } catch (e) {
      LoggerFactory.get(MystBotClient).error("Emoji counter error!");
      LoggerFactory.get(MystBotClient).error(e);
    }
  }

  // TODO: move to another structure
  private _handleLeveling(message: Message) {
    try {
      if (message.guild?.id && !message.author.bot) {
        this._levelingManager
          .resolve(message)
          .then((v) =>
            LoggerFactory.get(MystBotClient).debug(
              `<${message.guild?.id}> Leveling System - XP: ${
                v?.experience ?? -1
              } Level: ${v?.level ?? -1}`
            )
          );
      }
    } catch (e) {
      LoggerFactory.get(MystBotClient).error("Leveling system error!");
      LoggerFactory.get(MystBotClient).error(e);
    }
  }
}
