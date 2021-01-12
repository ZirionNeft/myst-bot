import type { TDatabase } from "./database/Database";
import { SapphireClient } from "@sapphire/framework";

export type Category = "Economy" | "Guild" | "Misc" | "Admin" | "General";

export class MystBotClient extends SapphireClient {
	private Database!: TDatabase;

	public get database(): TDatabase {
		return this.Database;
	}

	public set database(database) {
		this.Database = database;
	}
}

declare module "@sapphire/framework" {
	export interface CommandOptions {
		/**
		 * Is how to use this command, for example: !cmd <@member> [number]
		 * @default ''
		 */
		usages?: string;
		/**
		 * The command category
		 */
		category?: Category;
	}
}
