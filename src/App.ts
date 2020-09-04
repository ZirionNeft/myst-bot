import { Client } from "@typeit/discord";
import { Container } from "typescript-ioc";
import Throttle from "./logic/Throttle";
import Logger from "./utils/Logger";
import GuildService from "./services/GuildService";
import { config } from "node-config-ts";

export default class App {
  private static _client: Client;

  private static _logger = Logger.get(App);

  static get Client(): Client {
    return this._client;
  }

  static async start(): Promise<void> {
    this._client = new Client();

    this._logger.info("Logger level: %s", this._logger.level);

    await this.bindings();

    try {
      // In the login method, you must specify the glob string to load your classes (for the framework).
      // In this case that's not necessary because the entry point of your application is this file.
      await this._client.login(
        config.bot.token ?? "",
        `${__dirname}/${config.bot.name}Bot.ts`, // glob string to load the classes
        `${__dirname}/${config.bot.name}Bot.js` // If you compile your bot, the file extension will be .js
      );
    } catch (e) {
      App._logger.error("Login failed!");
    }
  }

  private static async bindings() {
    Container.bind(Throttle);
    Container.bind(GuildService);
  }
}
