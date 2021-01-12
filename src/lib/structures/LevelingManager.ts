import GuildLevelingFactory, { ExperienceDTO } from "./GuildLevelingFactory";
import {
	Container,
	OnlyInstantiableByContainer,
	Singleton,
} from "typescript-ioc";
import type { Message, Snowflake } from "discord.js";

@Singleton
@OnlyInstantiableByContainer
export default class LevelingManager {
	private _guildLevelingBuffer: Map<Snowflake, GuildLevelingFactory>;

	public constructor() {
		this._guildLevelingBuffer = new Map();
	}

	public async resolve({
		guild,
		author,
		content,
	}: Message): Promise<ExperienceDTO | undefined> {
		if (!guild) return;

		let guildLevelingFactory: GuildLevelingFactory | undefined = undefined;
		if (this._guildLevelingBuffer.has(guild.id)) {
			guildLevelingFactory = this._guildLevelingBuffer.get(guild.id);
		} else {
			guildLevelingFactory = Container.get(GuildLevelingFactory);
			guildLevelingFactory.guildId = guild.id;
			this._guildLevelingBuffer.set(guild.id, guildLevelingFactory);
		}

		return guildLevelingFactory?.resolve(author, content);
	}

	public async flushAll() {
		return Promise.all(
			[
				...this._guildLevelingBuffer.values(),
			].map((guildLevelingFactory) => guildLevelingFactory.flush())
		);
	}

	public async flush(guildId: Snowflake) {
		return this._guildLevelingBuffer.get(guildId)?.flush();
	}
}
