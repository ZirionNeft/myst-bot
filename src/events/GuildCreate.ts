import { ApplyOptions } from "@sapphire/decorators";
import { Event, Events, EventOptions } from "@sapphire/framework";
import LoggerFactory from "../lib/utils/LoggerFactory";
import { MystBotClient } from "../lib/MystBotClient";
import type { Guild } from "discord.js";
import { MessageHelpers } from "../lib/utils/MessageHelpers";
import GuildService from "../lib/services/GuildService";
import { Inject } from "typescript-ioc";

@ApplyOptions<EventOptions>({ event: Events.GuildCreate })
export class UserEvent extends Event<Events.GuildCreate> {
	@Inject
	private guildService!: GuildService;

	public async run(guild: Guild) {
		try {
			await this.guildService.findOneOrCreate(guild.id);
		} catch (e) {
			LoggerFactory.get(MystBotClient).error(e);
			guild.owner
				? await MessageHelpers.sendSystemErrorDM(guild.owner)
				: null;
		}
	}
}
