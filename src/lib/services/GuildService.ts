import type { Snowflake } from "discord.js";
import { Cacheable, CacheClear } from "@type-cacheable/core";
import { OnlyInstantiableByContainer, Singleton } from "typescript-ioc";
import { Transaction } from "sequelize";
import { GuildModel, GuildCreationAttributes } from "../database/models";

export interface IGuildService {
	findOne(id: Snowflake): Promise<GuildModel | null>;

	create(id: Snowflake, data?: GuildCreationAttributes): Promise<GuildModel>;

	findOneOrCreate(
		id: Snowflake,
		data?: GuildCreationAttributes
	): Promise<GuildModel>;

	update(
		id: Snowflake,
		data: Omit<GuildCreationAttributes, "guildId">,
		transaction?: Transaction
	): Promise<number | GuildModel[] | undefined>;
}

// TODO: need refactor for methods arguments

@Singleton
@OnlyInstantiableByContainer
export default class GuildService implements IGuildService {
	@CacheClear({
		cacheKey: (args) => args[0],
	})
	public async update(
		id: Snowflake,
		data: Omit<GuildCreationAttributes, "guildId">,
		transaction?: Transaction
	) {
		return (
			await GuildModel.update(data, {
				where: {
					guildId: id,
				},
				transaction,
			})
		).shift();
	}

	public async create(id: Snowflake, data?: GuildCreationAttributes) {
		return GuildModel.create({
			...{ guildId: id },
			...data,
		});
	}

	@Cacheable({ cacheKey: (args) => args[0], ttlSeconds: 120 })
	public async findOneOrCreate(
		id: Snowflake,
		data?: GuildCreationAttributes
	) {
		const [m] = await GuildModel.findCreateFind({
			where: {
				guildId: id,
			},
			defaults: { ...data, guildId: id } as GuildCreationAttributes,
		});
		return m;
	}

	@Cacheable({ cacheKey: (args) => args[0], ttlSeconds: 120 })
	public async findOne(id: Snowflake): Promise<GuildModel | null> {
		return GuildModel.findOne({
			where: {
				guildId: id,
			},
		});
	}
}
