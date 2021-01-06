import { TDatabase } from "./database/Database";
import { SapphireClient } from "@sapphire/framework";

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
