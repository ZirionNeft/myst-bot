import { Snowflake } from "discord.js";
import { Cacheable, CacheClear } from "@type-cacheable/core";
import { OnlyInstantiableByContainer, Singleton } from "typescript-ioc";
import { Transaction } from "sequelize";
import Emoji, { EmojiCreationAttributes } from "../database/models/Emoji";
import { Database } from "../database/Database";

export interface IEmojiService {
  findOne(id: Snowflake): Promise<Emoji | null>;

  create(id: Snowflake, data: EmojiCreationAttributes): Promise<Emoji>;

  findOneOrCreate(
    id: Snowflake,
    data?: EmojiCreationAttributes
  ): Promise<Emoji>;

  update(
    id: Snowflake,
    data: Partial<EmojiCreationAttributes>,
    transaction?: Transaction
  ): Promise<number | Emoji[] | undefined>;

  bulkUpdateOrCreate(...models: Emoji[]): Promise<Emoji[]>;

  guildScoped(id: Snowflake): Promise<Emoji[]>;

  emojiScoped(id: Snowflake): Promise<Emoji[]>;
}

@Singleton
@OnlyInstantiableByContainer
export default class EmojiService implements IEmojiService {
  private _setCacheKey = (args: any[]) => args[0];

  @CacheClear({
    cacheKey: this._setCacheKey,
  })
  async update(
    id: Snowflake,
    data: Partial<EmojiCreationAttributes>,
    transaction?: Transaction
  ) {
    return (
      await Emoji.update(data, {
        where: {
          emojiId: id,
        },
        transaction,
      })
    ).shift();
  }

  async guildScoped(id: Snowflake) {
    return Emoji.scope({ method: ["guild", id] }).findAll();
  }

  async emojiScoped(id: Snowflake) {
    return Emoji.scope({ method: ["emoji", id] }).findAll();
  }

  async create(id: Snowflake, data: EmojiCreationAttributes) {
    return await Emoji.create({
      ...{ emojiId: id },
      ...data,
    });
  }

  @Cacheable({ cacheKey: this._setCacheKey, ttlSeconds: 300 })
  async findOneOrCreate(id: Snowflake, data?: EmojiCreationAttributes) {
    const [m] = await Emoji.findCreateFind({
      where: {
        emojiId: id,
      },
      defaults: { ...data, emojiId: id } as EmojiCreationAttributes,
    });
    return m;
  }

  @Cacheable({ cacheKey: this._setCacheKey, ttlSeconds: 300 })
  async findOne(id: Snowflake): Promise<Emoji | null> {
    return await Emoji.findOne({
      where: {
        emojiId: id,
      },
    });
  }

  async bulkUpdateOrCreate(...models: EmojiCreationAttributes[]) {
    return await Emoji.bulkCreate(models, {
      updateOnDuplicate: ["name"],
      fields: ["guildId", "emojiId", "name"], // Fields to insert
      // Note: Sequelize with typescript doesn't support custom options in hooks
      //@ts-ignore
      rawInstances: [...models],
    });
  }
}
