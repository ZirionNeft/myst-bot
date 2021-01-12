import type { Snowflake } from "discord.js";
import { Cacheable, CacheClear } from "@type-cacheable/core";
import { OnlyInstantiableByContainer, Singleton } from "typescript-ioc";
import { Transaction } from "sequelize";
import {
	GuildCreationAttributes,
	SettingModel,
	SettingCreationAttributes,
} from "../database/models";

export interface ISettingService {
	findOne(guildId: Snowflake, name: string): Promise<SettingModel | null>;

	create(data: SettingCreationAttributes): Promise<SettingModel>;

	findOneOrCreate(data: GuildCreationAttributes): Promise<SettingModel>;

	update(
		data: Partial<SettingCreationAttributes>,
		transaction?: Transaction
	): Promise<number | SettingModel[] | undefined>;

	guildScoped(guildId: Snowflake): Promise<SettingModel[]>;

	upsert(
		data: SettingCreationAttributes
	): Promise<number | SettingModel | SettingModel[] | undefined>;
}

@Singleton
@OnlyInstantiableByContainer
export default class SettingService implements ISettingService {
	@CacheClear({
		cacheKey: (args: any[]) => [`${args[0].name}`, `guild-settings`],
		hashKey: (args) => args[0].guildId,
	})
	public async update(
		data: Partial<SettingCreationAttributes>,
		transaction?: Transaction
	) {
		return (
			await SettingModel.update(data, {
				where: {
					guildId: data.guildId,
					name: data.name,
				},
				transaction,
			})
		).shift();
	}

	public async create(data: SettingCreationAttributes) {
		return SettingModel.create(data);
	}

	public async upsert(data: SettingCreationAttributes) {
		const item = await SettingModel.findOne({
			where: {
				name: data.name,
				guildId: data.guildId,
			},
		});

		return item ? this.update(data) : this.create(data);
	}

	@Cacheable({
		cacheKey: (args) => `${args[0].name}`,
		hashKey: (args) => `${args[0].guildId}`,
		ttlSeconds: 86400,
	})
	public async findOneOrCreate(data: SettingCreationAttributes) {
		const [m] = await SettingModel.findCreateFind({
			where: {
				guildId: data.guildId,
				name: data.name,
			},
			defaults: data,
		});
		return m;
	}

	@Cacheable({
		cacheKey: (args) => `${args[1]}`,
		hashKey: (args) => `${args[0]}`,
		ttlSeconds: 86400,
	})
	public async findOne(
		guildId: Snowflake,
		name: string
	): Promise<SettingModel | null> {
		return SettingModel.findOne({
			where: {
				guildId,
				name,
			},
		});
	}

	@Cacheable({
		cacheKey: "guild-settings",
		hashKey: (args) => args[0],
		ttlSeconds: 86400,
	})
	public async guildScoped(guildId: Snowflake) {
		return SettingModel.scope({ method: ["guild", guildId] }).findAll();
	}
}
