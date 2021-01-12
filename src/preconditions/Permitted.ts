import { Container } from "typescript-ioc";
import {
	PermissionName,
	PermissionsManager,
} from "../lib/structures/PermissionsManager";
import { MessageHelpers } from "../lib/utils/MessageHelpers";
import type { Message } from "discord.js";
import {
	AsyncPreconditionResult,
	Command,
	Precondition,
	PreconditionContext,
} from "@sapphire/framework";

export interface PermittedContext extends PreconditionContext {
	permissionNames: PermissionName[];
}

export class Permitted extends Precondition {
	public async run(
		message: Message,
		_command: Command,
		context: PermittedContext
	): AsyncPreconditionResult {
		if (!message.guild) return this.error("Command allowed only in guild");

		if (
			message.author.id === message.guild.ownerID ||
			(await Container.get(PermissionsManager).authorHasPermissions(
				message.guild,
				message.author,
				context.permissionNames
			))
		) {
			return this.ok();
		}
		await MessageHelpers.sendPublicNote(message, "not enough permissions!");
		return this.error("Not enough permissions!");
	}
}
