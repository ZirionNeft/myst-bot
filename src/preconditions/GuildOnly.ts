import { DMChannel, Message } from "discord.js";
import { Container } from "typescript-ioc";
import GuildService from "../lib/services/GuildService";
import LoggerFactory from "../lib/utils/LoggerFactory";
import { AsyncPreconditionResult, Precondition } from "@sapphire/framework";

export class GuildOnly extends Precondition {
	public async run(message: Message): AsyncPreconditionResult {
		if (!(message.channel instanceof DMChannel) && message.guild) {
			try {
				// Check that guild exists in database
				// TODO: optimize in future coz this action will perform after every guild command
				await Container.get(GuildService).findOneOrCreate(
					message.guild.id
				);
			} catch (e) {
				LoggerFactory.get(GuildOnly).error(e);
			}

			return this.ok();
		}

		return this.error(this.name, "You cannot run this command in DMs.");
	}
}
