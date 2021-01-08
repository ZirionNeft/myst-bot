import { Inject, OnlyInstantiableByContainer, Singleton } from "typescript-ioc";
import { Snowflake } from "discord.js";
import EmojiService from "../services/EmojiService";
import { EmojiCreationAttributes } from "../database/models/Emoji.model";
import LoggerFactory from "../utils/LoggerFactory";
import Timeout = NodeJS.Timeout;

const LOAD_INTERVAL = 15000;

export interface EmojiDTO {
  guildId: Snowflake;
  emojiId: Snowflake;
  name: string;
}

export interface Counter {
  count: number;
}

export type FullEmojiDTO = EmojiDTO & Counter;

@Singleton
@OnlyInstantiableByContainer
export default class EmojiCountManager {
  @Inject
  private _emojiService!: EmojiService;

  private _emojiAccumulator: Map<Snowflake, FullEmojiDTO>;

  private _interval: Timeout | null;

  constructor() {
    this._emojiAccumulator = new Map();
    this._interval = null;
  }

  async add(...emojis: EmojiDTO[]) {
    let oldData: FullEmojiDTO | undefined;
    let counter = 0;

    for (let emoji of emojis) {
      if (!emoji) continue;
      if (this._emojiAccumulator.has(emoji.emojiId)) {
        oldData = this._emojiAccumulator.get(emoji.emojiId);
      }

      this._emojiAccumulator.set(emoji.emojiId, {
        ...emoji,
        count: (oldData?.count ?? 0) + 1,
      });
      counter++;
    }
    if (!this._interval) {
      this._interval = setInterval(
        this._loadDataToDB.bind(this),
        LOAD_INTERVAL
      );
    }

    return counter;
  }

  private async _loadDataToDB() {
    try {
      const size = this._emojiAccumulator.size;

      if (size) {
        const emojiEntities = Array.from(this._emojiAccumulator.values()).map(
          (v) =>
            ({
              counter: v.count,
              guildId: v.guildId,
              emojiId: v.emojiId,
              name: v.name,
            } as EmojiCreationAttributes)
        );
        await this._emojiService.bulkUpdateOrCreate(...emojiEntities);

        LoggerFactory.get(EmojiCountManager).debug(
          `Emojis sent to Database: %d`,
          size
        );

        this._clear();
      }
    } catch (e) {
      LoggerFactory.get(EmojiCountManager).error(e);
      this._clear();
    }
  }

  private _clear() {
    this._emojiAccumulator.clear();
    LoggerFactory.get(EmojiCountManager).debug(
      "Emojis accumulator has been cleaned!"
    );
  }
}
