import { Inject, OnlyInstantiableByContainer, Singleton } from "typescript-ioc";
import { Snowflake } from "discord.js";
import EmojiService from "../services/EmojiService";
import Emoji, { EmojiCreationAttributes } from "../database/models/Emoji";
import Timeout = NodeJS.Timeout;
import Sequelize from "sequelize";

const LOAD_INTERVAL = 5000;

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

  async add(...emoji: EmojiDTO[]) {
    let oldData: FullEmojiDTO | undefined;
    let c = 0;

    for (let e of emoji) {
      if (!e) continue;
      if (this._emojiAccumulator.has(e.emojiId)) {
        oldData = this._emojiAccumulator.get(e.emojiId);
      }

      this._emojiAccumulator.set(e.emojiId, {
        ...e,
        count: (oldData?.count ?? 0) + 1,
      });
      c++;
    }
    if (!this._interval) {
      this._interval = setInterval(
        this._loadDataToDB.bind(this),
        LOAD_INTERVAL
      );
    }

    return c;
  }

  private async _loadDataToDB() {
    try {
      const size = this._emojiAccumulator.size;

      if (size) {
        const v = Array.from(this._emojiAccumulator.values()).map(
          (v) =>
            ({
              counter: v.count,
              guildId: v.guildId,
              emojiId: v.emojiId,
              name: v.name,
            } as EmojiCreationAttributes)
        );
        await this._emojiService.bulkUpdateOrCreate(...v);

        console.info(`Emojis sent to Database: ${size}`);

        this._clear();
      }
    } catch (e) {
      console.error(e);
      this._clear();
    }
  }

  private _clear() {
    this._emojiAccumulator.clear();
    console.info("Emojis accumulator has been cleaned!");
  }
}
