import { ApplyOptions } from "@sapphire/decorators";
import { Event, EventOptions, Events } from "@sapphire/framework";
import LoggerFactory from "../lib/utils/LoggerFactory";
import { MystBotClient } from "../lib/MystBotClient";
import { StringHelpers } from "../lib/utils/StringHelpers";
import type { Message, Snowflake } from "discord.js";
import EmojiCountManager from "../lib/structures/EmojiCountManager";
import { Inject } from "typescript-ioc";
import LevelingManager from "../lib/structures/LevelingManager";

export interface EmojiCounterDTO {
	name: string;
	id: Snowflake;
	animated?: boolean;
}

@ApplyOptions<EventOptions>({ event: Events.Message })
export class UserEvent extends Event<Events.Message> {
	@Inject
	private emojiCountManager!: EmojiCountManager;

	@Inject
	private levelingManager!: LevelingManager;

	// TODO: Make async?
	public run(message: Message) {
		this.handleEmojis(message);
		this.handleLeveling(message);
	}

	// TODO: move to another structure
	private handleEmojis(message: Message) {
		const emojis = (
			message.content.match(/<a:.+?:\d+>|<:.+?:\d+>/g) || []
		).map(
			(e) => StringHelpers.getEmojiDataFromString(e) as EmojiCounterDTO
		);

		try {
			if (message.guild?.id && emojis?.length) {
				const guildId = message.guild.id;
				const added = this.emojiCountManager.add(
					...emojis.map((e) => ({
						guildId,
						emojiId: e.id,
						name: e.name,
					}))
				);

				LoggerFactory.get(MystBotClient).info(
					`Emojis accumulated: ${added}`
				);
			}
		} catch (e) {
			LoggerFactory.get(MystBotClient).error(e);
		}
	}

	// TODO: move to another structure
	private handleLeveling(message: Message) {
		try {
			if (message.guild?.id && !message.author.bot) {
				void this.levelingManager
					.resolve(message)
					.then((v) =>
						LoggerFactory.get(MystBotClient).debug(
							`<${message.guild?.id}> Leveling System - XP: ${
								v?.experience ?? -1
							} Level: ${v?.level ?? -1}`
						)
					);
			}
		} catch (e) {
			LoggerFactory.get(MystBotClient).error(e);
		}
	}
}
