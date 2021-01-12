import type { Message, Snowflake } from "discord.js";
import {
	PreconditionResult,
	Command,
	Precondition,
	PreconditionContext,
} from "@sapphire/framework";

export interface HasRoleContext extends PreconditionContext {
	roleId: Snowflake;
}

export class HasRole extends Precondition {
	public run(
		message: Message,
		_command: Command,
		context: HasRoleContext
	): PreconditionResult {
		const { roleId } = context;

		if (message.member?.roles.cache.find((r) => r.id === roleId)) {
			return this.ok();
		}

		return this.error(
			this.name,
			`To perform that do you must have a role <@${roleId}>`
		);
	}
}
