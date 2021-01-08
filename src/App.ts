import { Container, Scope } from "typescript-ioc";
import LoggerFactory from "./lib/utils/LoggerFactory";
import GuildService from "./lib/services/GuildService";
import { config } from "node-config-ts";
import EventManager, {
  BusinessEvent,
  Subscriber,
} from "./lib/structures/EventManager";
import { LevelUpSubscriber } from "./lib/subscribers/LevelUpSubscriber";
import LevelingManager from "./lib/structures/LevelingManager";
import SettingService from "./lib/services/SettingService";
import { PermissionsManager } from "./lib/structures/PermissionsManager";
import { MystBotClient } from "./lib/MystBotClient";
import BotHelpers from "./lib/utils/BotHelpers";
import { LogLevel } from "@sapphire/framework";
import { Message } from "discord.js";

// *** SAPPHIRE PLUGINS ***
import "@sapphire/plugin-subcommands/register";
import { getDatabase } from "./lib/database/Database";

export default class App {
  private static _client: MystBotClient;

  static get Client(): MystBotClient {
    return this._client;
  }

  static async start(): Promise<void> {
    this._client = new MystBotClient({
      messageEditHistoryMaxSize: 0,
      presence: {
        status: "online",
        activity: { type: "LISTENING", name: `${config.bot.prefix}help` },
      },
      subCommands: {
        overlappedPreconditions: ["Cooldown"],
      },
      logger: {
        instance: LoggerFactory.get(App),
        level:
          LoggerFactory.get(App).level ?? config.general.debug
            ? LogLevel.Debug
            : LogLevel.Info,
      },
      fetchPrefix: async (message: Message) =>
        await BotHelpers.getPrefixWithPriority(message.guild?.id),
      // TODO when high-load: Design intents
      // https://discordjs.guide/popular-topics/intents.html
      // ws: {
      //   intents: new Intents(["GUILD_MESSAGES", "GUILDS"]),
      // },
    });

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
      this.Client.database = await getDatabase();
      await this._client.login(config.bot.token ?? "");
      LoggerFactory.get(App).info(">>> Bot successfully started up!");
    } catch (e) {
      LoggerFactory.get(App).error(e);
    }

    process.on("SIGINT", this.processExit);
    process.on("SIGTERM", this.processExit);
  }

  private static _bindings() {
    Container.bind(GuildService);
    Container.bind(SettingService);
    Container.bind(EventManager);
    Container.bind(PermissionsManager);
  }

  // TODO: refactor to metadata and reflection API
  private static async _bindSubscribers(
    subscribers: { new (): Subscriber<BusinessEvent> }[]
  ) {
    try {
      for (const subscriberClass of subscribers) {
        Container.bind(subscriberClass).to(App).scope(Scope.Singleton);
      }
    } catch (e) {
      LoggerFactory.get(App).error(e);
    }
    return subscribers;
  }

  private static processExit() {
    const levelingManager = Container.get(LevelingManager);

    levelingManager.flushAll().then(() => {
      LoggerFactory.get(App).info("Experience buffer was flushed!");
      process.exit();
    });
  }
}

export type Category = "Economy" | "Guild" | "Misc" | "Admin" | "General";
