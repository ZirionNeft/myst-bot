import { Client } from "@typeit/discord";
import { Container, Scope } from "typescript-ioc";
import Throttle from "./logic/Throttle";
import LoggerFactory from "./utils/LoggerFactory";
import GuildService from "./services/GuildService";
import { config } from "node-config-ts";
import EventManager from "./logic/EventManager";
import { LevelUpSubscriber } from "./events/LevelUpSubscriber";
import { BusinessEvent, Subscriber } from "mystbot";
import LevelingManager from "./logic/LevelingManager";

export default class App {
  private static _client: Client;

  static get Client(): Client {
    return this._client;
  }

  static async start(): Promise<void> {
    this._client = new Client();

    LoggerFactory.get(App).info(
      "Logger level: %s",
      LoggerFactory.get(App).level
    );

    this._bindings();

    this._bindSubscribers([LevelUpSubscriber]).then((ctors) =>
      ctors.map((subscriber) =>
        // Init classes to load event handlers
        Container.get<typeof subscriber>(subscriber)
      )
    );

    try {
      // In the login method, you must specify the glob string to load your classes (for the framework).
      // In this case that's not necessary because the entry point of your application is this file.
      await this._client.login(
        config.bot.token ?? "",
        `${__dirname}/${config.bot.name}Bot.ts`, // glob string to load the classes
        `${__dirname}/${config.bot.name}Bot.js` // If you compile your bot, the file extension will be .js
      );
    } catch (e) {
      LoggerFactory.get(App).error("Login failed!");
    }

    process.on("SIGINT", this.processExit);
    process.on("SIGTERM", this.processExit);
  }

  private static _bindings() {
    Container.bind(Throttle);
    Container.bind(GuildService);
    Container.bind(EventManager);
  }

  // TODO: refactor to metadata and reflection API
  private static async _bindSubscribers(
    subscribers: { new (): Subscriber<BusinessEvent> }[]
  ) {
    try {
      for (let subscriberClass of subscribers) {
        Container.bind(subscriberClass).to(App).scope(Scope.Singleton);
      }
    } catch (e) {
      LoggerFactory.get(App).error(e);
    }
    return subscribers;
  }

  private static processExit() {
    const eventManager = Container.get(LevelingManager);

    eventManager.flushAll().then(() => {
      LoggerFactory.get(App).info("Experience has been flushed!");
      process.exit();
    });
  }
}
