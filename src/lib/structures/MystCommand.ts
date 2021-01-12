import type { Args, PieceContext, CommandOptions } from "@sapphire/framework";
import { Command } from "@sapphire/plugin-subcommands";
import type { Category } from "../MystBotClient";

export abstract class MystCommand<T = Args> extends Command<T> {
	public usages: string;
	public category: Category;

	protected constructor(context: PieceContext, options: CommandOptions = {}) {
		super(context, options);
		this.usages = options.usages ?? "";
		this.category = options.category ?? "General";
	}
}
declare module "@sapphire/framework" {
	interface Command {
		usages: string;
		category: Category;
	}
}
