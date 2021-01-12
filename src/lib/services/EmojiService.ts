import type { Snowflake } from "discord.js";
import { Cacheable, CacheClear } from "@type-cacheable/core";
import { OnlyInstantiableByContainer, Singleton } from "typescript-ioc";
import { Transaction } from "sequelize";
import { EmojiModel, EmojiCreationAttributes } from "../database/models";

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

	bulkUpdateOrCreate(
		...models: EmojiCreationAttributes[]
	): Promise<EmojiModel[]>;

	guildScoped(id: Snowflake): Promise<EmojiModel[]>;

	emojiScoped(id: Snowflake): Promise<EmojiModel[]>;
}

@Singleton
@OnlyInstantiableByContainer
export default class EmojiService implements IEmojiService {
	@CacheClear({
		cacheKey: (args) => args[0],
		hashKey: (args) => args[0].guildiId,
	})
	public async update(
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

	public async guildScoped(id: Snowflake) {
		return EmojiModel.scope({ method: ["guild", id] }).findAll();
	}

	public async emojiScoped(id: Snowflake) {
		return EmojiModel.scope({ method: ["emoji", id] }).findAll();
	}

	public async create(id: Snowflake, data: EmojiCreationAttributes) {
		return EmojiModel.create({
			...{ emojiId: id },
			...data,
		});
	}

	@Cacheable({
		cacheKey: (args) => args[0],
		ttlSeconds: 600,
	})
	public async findOneOrCreate(
		id: Snowflake,
		data?: EmojiCreationAttributes
	) {
		const [m] = await EmojiModel.findCreateFind({
			where: {
				emojiId: id,
			},
			defaults: { ...data, emojiId: id } as EmojiCreationAttributes,
		});
		return m;
	}

	@Cacheable({
		cacheKey: (args) => args[0],
		ttlSeconds: 600,
	})
	public async findOne(id: Snowflake): Promise<EmojiModel | null> {
		return EmojiModel.findOne({
			where: {
				emojiId: id,
			},
		});
	}

	@CacheClear({
		cacheKey: (args: EmojiCreationAttributes[]) =>
			args.map((m) => m.emojiId),
	})
	public async bulkUpdateOrCreate(...models: EmojiCreationAttributes[]) {
		return EmojiModel.bulkCreate(models, {
			updateOnDuplicate: ["name"],
			fields: ["guildId", "emojiId", "name"], // Fields to insert
			// Note: Sequelize with typescript doesn't support custom options in hooks
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			rawInstances: [
				...models.map((m) => ({
					counter: m.counter,
					emojiId: m.emojiId,
				})),
			],
		});
	}
}
