import { TDatabase } from "./database/Database";
import { SapphireClient } from "@sapphire/framework";
import { Category } from "../App";

export class MystBotClient extends SapphireClient {
  // Initialises in events/Ready
  private _database!: TDatabase;

  get database() {
    return this._database;
  }

  set database(database) {
    this._database = database;
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
