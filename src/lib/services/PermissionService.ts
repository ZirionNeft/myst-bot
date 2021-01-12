import type { Snowflake } from "discord.js";
import { Cacheable, CacheClear } from "@type-cacheable/core";
import { OnlyInstantiableByContainer, Singleton } from "typescript-ioc";
import {
	PermissionAttributes,
	PermissionCreationAttributes,
	PermissionModel,
} from "../database/models";

export interface IPermissionService {
	findOne(
		data: PermissionCreationAttributes
	): Promise<PermissionModel | null>;

	create(
		...models: PermissionCreationAttributes[]
	): Promise<PermissionModel[]>;

	findOneOrCreate(
		data: PermissionCreationAttributes
	): Promise<PermissionModel>;

	delete(...models: PermissionAttributes[]): Promise<number>;

	guildScoped(guildId: Snowflake): Promise<PermissionModel[]>;
}

@Singleton
@OnlyInstantiableByContainer
export default class PermissionService implements IPermissionService {
	@CacheClear({
		cacheKey: (...args: any[]) => [
			...args.map((m) => m.roleId),
			`guild-permissions`,
		],
		hashKey: (args) => args[0].guildId,
	})
	public async delete(...models: PermissionAttributes[]) {
		if (
			models.length > 1 &&
			!models.every((m) => m.guildId === models[0].guildId)
		) {
			throw new Error(
				"Given models haven't the same guildId. Bulk destroying cancelled"
			);
		}
		return PermissionModel.destroy({
			where: {
				id: models.map((m) => m.id),
			},
		});
	}

	public async create(...models: PermissionCreationAttributes[]) {
		return PermissionModel.bulkCreate(models);
	}

	public async findOneOrCreate(data: PermissionCreationAttributes) {
		const [m] = await PermissionModel.findCreateFind({
			where: {
				guildId: data.guildId,
				roleId: data.roleId,
			},
			defaults: data,
		});
		return m;
	}

	// Note: No cache because permissions can be set up in web panel
	public async findOne(
		data: PermissionCreationAttributes
	): Promise<PermissionModel | null> {
		return PermissionModel.findOne({
			where: {
				guildId: data.guildId,
			},
		});
	}

	@Cacheable({
		cacheKey: "guild-permissions",
		hashKey: (args) => args[0],
		ttlSeconds: 86400,
	})
	public async guildScoped(guildId: Snowflake) {
		return PermissionModel.scope({ method: ["guild", guildId] }).findAll();
	}

	@Cacheable({
		cacheKey: (args) => `${args[1]}`,
		hashKey: (args) => args[0],
		ttlSeconds: 86400,
	})
	public async getRoleAll(guildId: Snowflake, roleId: Snowflake) {
		return PermissionModel.scope({
			method: ["target", guildId, roleId],
		}).findAll();
	}
}
