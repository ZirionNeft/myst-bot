import { Snowflake } from "discord.js";
import { Cacheable, CacheClear } from "@type-cacheable/core";
import { OnlyInstantiableByContainer, Singleton } from "typescript-ioc";
import { Transaction } from "sequelize";
import EmojiModel, {
  EmojiCreationAttributes,
} from "../database/models/Emoji.model";

export interface IEmojiService {
  findOne(id: Snowflake): Promise<EmojiModel | null>;

  create(id: Snowflake, data: EmojiCreationAttributes): Promise<EmojiModel>;

  findOneOrCreate(
    id: Snowflake,
    data?: EmojiCreationAttributes
  ): Promise<EmojiModel>;

  update(
    id: Snowflake,
    data: Partial<EmojiCreationAttributes>,
    transaction?: Transaction
  ): Promise<number | EmojiModel[] | undefined>;

  bulkUpdateOrCreate(...models: EmojiModel[]): Promise<EmojiModel[]>;

  guildScoped(id: Snowflake): Promise<EmojiModel[]>;

  emojiScoped(id: Snowflake): Promise<EmojiModel[]>;
}

const CACHE_BUILDER = (args: any[]) => args[0];

@Singleton
@OnlyInstantiableByContainer
export default class EmojiService implements IEmojiService {
  @CacheClear({
    cacheKey: CACHE_BUILDER,
  })
  async update(
    id: Snowflake,
    data: Partial<EmojiCreationAttributes>,
    transaction?: Transaction
  ) {
    return (
      await EmojiModel.update(data, {
        where: {
          emojiId: id,
        },
        transaction,
      })
    ).shift();
  }

  async guildScoped(id: Snowflake) {
    return EmojiModel.scope({ method: ["guild", id] }).findAll();
  }

  async emojiScoped(id: Snowflake) {
    return EmojiModel.scope({ method: ["emoji", id] }).findAll();
  }

  async create(id: Snowflake, data: EmojiCreationAttributes) {
    return await EmojiModel.create({
      ...{ emojiId: id },
      ...data,
    });
  }

  @Cacheable({ cacheKey: CACHE_BUILDER, ttlSeconds: 300 })
  async findOneOrCreate(id: Snowflake, data?: EmojiCreationAttributes) {
    const [m] = await EmojiModel.findCreateFind({
      where: {
        emojiId: id,
      },
      defaults: { ...data, emojiId: id } as EmojiCreationAttributes,
    });
    return m;
  }

  @Cacheable({ cacheKey: this._setCacheKey, ttlSeconds: 300 })
  async findOne(id: Snowflake): Promise<EmojiModel | null> {
    return await EmojiModel.findOne({
      where: {
        emojiId: id,
      },
    });
  }

  async bulkUpdateOrCreate(...models: EmojiCreationAttributes[]) {
    return await EmojiModel.bulkCreate(models, {
      updateOnDuplicate: ["name"],
      fields: ["guildId", "emojiId", "name"], // Fields to insert
      // Note: Sequelize with typescript doesn't support custom options in hooks
      //@ts-ignore
      rawInstances: [
        ...models.map((m) => ({ counter: m.counter, emojiId: m.emojiId })),
      ],
    });
  }
}
