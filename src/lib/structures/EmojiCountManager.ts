import { Inject, OnlyInstantiableByContainer, Singleton } from "typescript-ioc";
import type { Snowflake } from "discord.js";
import EmojiService from "../services/EmojiService";
import type { EmojiCreationAttributes } from "../database/models";
import LoggerFactory from "../utils/LoggerFactory";
import Timeout = NodeJS.Timeout;

const LOAD_INTERVAL = 15000;

export interface EmojiDTO {
	guildId: Snowflake;
	emojiId: Snowflake;
	name: string;
}

export interface Counter {
	count: number;
}

export type FullEmojiDTO = EmojiDTO & Counter;

// TODO: Too messy. Create abstract 'Manager'(or similar) class

@Singleton
@OnlyInstantiableByContainer
export default class EmojiCountManager {
	@Inject
	private emojiService!: EmojiService;

	private emojiAccumulator: Map<Snowflake, FullEmojiDTO>;

	private interval: Timeout | null;

	public constructor() {
		this.emojiAccumulator = new Map();
		this.interval = null;
	}

	public add(...emojis: EmojiDTO[]) {
		let oldData: FullEmojiDTO | undefined = undefined;
		let counter = 0;

		for (const emoji of emojis) {
			if (!emoji) continue;
			if (this.emojiAccumulator.has(emoji.emojiId)) {
				oldData = this.emojiAccumulator.get(emoji.emojiId);
			}

			this.emojiAccumulator.set(emoji.emojiId, {
				...emoji,
				count: (oldData?.count ?? 0) + 1,
			});
			counter++;
		}
		if (!this.interval) {
			this.interval = setInterval(
				this.loadDataToDB.bind(this),
				LOAD_INTERVAL
			);
		}

		return counter;
	}

	private async loadDataToDB() {
		try {
			const { size } = this.emojiAccumulator;

			if (size) {
				const emojiEntities = Array.from(
					this.emojiAccumulator.values()
				).map(
					(v) =>
						({
							counter: v.count,
							guildId: v.guildId,
							emojiId: v.emojiId,
							name: v.name,
						} as EmojiCreationAttributes)
				);
				await this.emojiService.bulkUpdateOrCreate(...emojiEntities);

				LoggerFactory.get(EmojiCountManager).debug(
					`Emojis sent to Database: %d`,
					size
				);

				this.clear();
			}
		} catch (e) {
			LoggerFactory.get(EmojiCountManager).error(e);
			this.clear();
		}
	}

	private clear() {
		this.emojiAccumulator.clear();
		LoggerFactory.get(EmojiCountManager).debug(
			"Emojis accumulator has been cleaned!"
		);
	}
}
