import { Factory, Inject, OnlyInstantiableByContainer } from "typescript-ioc";
import UserService from "../services/UserService";
import type { Snowflake, User } from "discord.js";
import LoggerFactory from "../utils/LoggerFactory";
import type { UserCreationAttributes } from "../database/models";
import GuildService from "../services/GuildService";
import EventBus from "./EventBus";
import Timeout = NodeJS.Timeout;

const FLUSH_INTERVAL = 30000;

export type ExperienceBufferKey = Snowflake;

export function calculateNextLevelXp(level: Level): Experience {
	const exponent = 1.5;
	const baseXP = 500;
	return Math.floor(baseXP * Math.pow(level, exponent));
}

// TODO: refactor interfaces names
interface IExtendedExpDTO extends ExperienceDTO {
	nextLevelExp: Experience;
}
export interface ExperienceDTO {
	experience: Experience;
	level: Level;
}
type Experience = number;
type Level = number;

@Factory(() => new GuildLevelingFactory())
@OnlyInstantiableByContainer
export default class GuildLevelingFactory {
	@Inject
	private userService!: UserService;

	@Inject
	private guildService!: GuildService;

	@Inject
	private eventManager!: EventBus;

	private readonly experienceBuffer: Map<
		ExperienceBufferKey,
		IExtendedExpDTO
	>;

	private interval: Timeout | null;

	private _guildId!: Snowflake;

	public constructor() {
		this.interval = null;
		this.experienceBuffer = new Map();
	}

	public get guildId(): Snowflake {
		return this._guildId;
	}

	public set guildId(value: Snowflake) {
		this._guildId = value;
	}

	public async flush() {
		LoggerFactory.get(GuildLevelingFactory).info(
			"[Guild: %s] Experience buffer flushing...",
			this.guildId
		);
		await this.flushCallback();
	}

	public async resolve(
		author: User,
		content: string
	): Promise<ExperienceDTO | undefined> {
		if (!this._guildId)
			throw new Error(
				"GuildLeveling resolving error: guildId not specified"
			);

		const symbolsLength = content.trim().length;
		if (!symbolsLength) {
			return;
		}

		const experienceKey: ExperienceBufferKey = author.id;

		try {
			let experienceValue: IExtendedExpDTO | undefined = undefined;

			if (this.experienceBuffer.has(experienceKey)) {
				const value = this.experienceBuffer.get(experienceKey);
				experienceValue = {
					experience: (value?.experience ?? 0) + symbolsLength,
					level: value?.level ?? 1,
					nextLevelExp: calculateNextLevelXp(value?.level ?? 1),
				};
			} else {
				// Before we try to create the user, we must to check that the guild is exist
				await this.guildService.findOneOrCreate(this._guildId);

				const userEntity = await this.userService.findOneOrCreate(
					author.id,
					this._guildId
				);
				experienceValue = {
					experience: Number(userEntity.experience) + symbolsLength,
					level: userEntity.level,
					nextLevelExp: calculateNextLevelXp(userEntity.level),
				};
			}

			if (experienceValue.experience >= experienceValue.nextLevelExp) {
				const calculated = this.calculateLevel(
					author.id,
					experienceValue
				);
				experienceValue = {
					...calculated,
					nextLevelExp: calculateNextLevelXp(calculated.level),
				};
			}

			this.experienceBuffer.set(experienceKey, experienceValue);

			if (!this.interval) {
				this.interval = setInterval(
					this.flushCallback.bind(this),
					FLUSH_INTERVAL
				);
			}

			return experienceValue;
		} catch (e) {
			LoggerFactory.get(GuildLevelingFactory).error(e);
		}

		return undefined;
	}

	private async flushCallback() {
		try {
			const { size } = this.experienceBuffer;

			if (size) {
				const userEntities = Array.from(
					this.experienceBuffer.entries()
				).map(([key, value]: [ExperienceBufferKey, ExperienceDTO]) => {
					return {
						userId: key,
						guildId: this._guildId,
						...this.calculateLevel(key, value),
					} as UserCreationAttributes;
				});
				await this.userService.bulkUpdateOrCreate(...userEntities);

				LoggerFactory.get(GuildLevelingFactory).debug(
					`User experience positions sent: %d`,
					size
				);

				this._clear();
			}
		} catch (e) {
			LoggerFactory.get(GuildLevelingFactory).error(e);
			this._clear();
		}
	}

	private _clear() {
		this.experienceBuffer.clear();
		LoggerFactory.get(GuildLevelingFactory).debug(
			"User experience buffer flushed"
		);
	}

	private calculateLevel(
		userId: Snowflake,
		{ experience, level }: ExperienceDTO
	): ExperienceDTO {
		for (
			let nextLevelXp = calculateNextLevelXp(level);
			experience >= nextLevelXp;
			nextLevelXp = calculateNextLevelXp(level)
		) {
			experience -= nextLevelXp;
			level++;

			// TODO: refactor? - S-term of SOLID
			this.eventManager.notify("levelUp", [
				userId,
				this._guildId,
				{ level, experience },
			]);
		}
		return { level, experience };
	}
}
