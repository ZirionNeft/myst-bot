import type { Snowflake } from "discord.js";
import { Cacheable, CacheClear } from "@type-cacheable/core";
import { UserCreationAttributes, UserModel } from "../database/models";
import { OnlyInstantiableByContainer, Singleton } from "typescript-ioc";
import { Op, Transaction } from "sequelize";

export interface IUserService {
	getAllPositiveCoins(guildId: Snowflake): Promise<UserModel[]>;

	getUsersLeveling(guildId: Snowflake): Promise<UserModel[]>;

	update(
		id: Snowflake,
		guildDataId: Snowflake,
		data: Omit<UserCreationAttributes, "guildId" | "userId">,
		transaction?: Transaction
	): Promise<number | UserModel[] | undefined>;

	create(
		userId: Snowflake,
		guildId: Snowflake,
		data?: UserCreationAttributes
	): Promise<UserModel | undefined>;

	findOne(userId: Snowflake, guildId: Snowflake): Promise<UserModel | null>;

	findOneOrCreate(
		userId: Snowflake,
		guildId: Snowflake,
		data?: UserCreationAttributes
	): Promise<UserModel>;

	bulkUpdateOrCreate(
		...models: UserCreationAttributes[]
	): Promise<UserModel[]>;
}

@Singleton
@OnlyInstantiableByContainer
export default class UserService implements IUserService {
	@CacheClear({
		cacheKey: (args: any[]) => args[0],
		hashKey: (args) => args[1],
	})
	public async update(
		userId: Snowflake,
		guildId: Snowflake,
		data: Omit<UserCreationAttributes, "guildId" | "userId">,
		transaction?: Transaction
	) {
		return (
			await UserModel.update(data, {
				where: {
					[Op.and]: {
						guildId,
						userId,
					},
				},
				transaction,
			})
		).shift();
	}

	public async create(
		userId: Snowflake,
		guildId: Snowflake,
		data?: UserCreationAttributes
	) {
		return UserModel.create({
			...{ userId, guildId },
			...data,
		});
	}

	@Cacheable({
		cacheKey: (args) => args[0],
		hashKey: (args) => args[1],
		ttlSeconds: 120,
	})
	public async findOneOrCreate(
		userId: Snowflake,
		guildId: Snowflake,
		data?: UserCreationAttributes
	) {
		const [m] = await UserModel.findOrCreate({
			where: {
				[Op.and]: {
					userId,
					guildId,
				},
			},
			defaults: { ...data, guildId, userId } as UserCreationAttributes,
		});

		return m;
	}

	@Cacheable({
		cacheKey: (args) => `${args[0]}`,
		hashKey: (args) => `${args[1]}`,
		ttlSeconds: 120,
	})
	public async findOne(
		userId: Snowflake,
		guildId: Snowflake
	): Promise<UserModel | null> {
		return UserModel.findOne({
			where: {
				userId,
				guildId,
			},
		});
	}

	@CacheClear({
		cacheKey: (models: any[]) =>
			(models as UserCreationAttributes[]).map(({ userId }) => userId),
	})
	public async bulkUpdateOrCreate(...models: UserCreationAttributes[]) {
		return UserModel.bulkCreate(models, {
			updateOnDuplicate: ["experience", "level"],
			fields: ["guildId", "userId", "experience", "level"], // Fields to insert
		});
	}

	@Cacheable({
		cacheKey: (args: any[]) => args[0],
		hashKey: "all-positive-coins",
		ttlSeconds: 600,
	})
	public async getAllPositiveCoins(guildId: Snowflake): Promise<UserModel[]> {
		return UserModel.findAll({
			where: {
				[Op.and]: {
					coins: {
						[Op.gt]: 0,
					},
					guildId,
				},
			},
			order: [["coins", "DESC"]],
		});
	}

	public async getUsersLeveling(guildId: Snowflake): Promise<UserModel[]> {
		return UserModel.findAll({
			where: {
				guildId,
			},
			order: [
				["level", "DESC"],
				["experience", "DESC"],
			],
		});
	}
}
