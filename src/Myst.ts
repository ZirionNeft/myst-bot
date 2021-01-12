import { Container, Scope } from "typescript-ioc";
import LoggerFactory from "./lib/utils/LoggerFactory";
import GuildService from "./lib/services/GuildService";
import EventBus, { BusinessEvent, Subscriber } from "./lib/structures/EventBus";
import { LevelUpSubscriber } from "./lib/subscribers/LevelUpSubscriber";
import LevelingManager from "./lib/structures/LevelingManager";
import SettingService from "./lib/services/SettingService";
import { PermissionsManager } from "./lib/structures/PermissionsManager";
import { MystBotClient } from "./lib/MystBotClient";
import { getPrefixWithPriority } from "./lib/utils/BotHelpers";
import { LogLevel } from "@sapphire/framework";
import type { Message } from "discord.js";
import { getDatabase } from "./lib/database/Database";
import * as dotenv from "dotenv";
import CacheManager from "@type-cacheable/core";
import { NodeCacheAdapter } from "@type-cacheable/node-cache-adapter";
import NodeCache from "node-cache";
import { Config, config } from "node-config-ts";

// *** SAPPHIRE PLUGINS ***
import "@sapphire/plugin-subcommands/register";

export function bindEnvVars(config: Config) {
	// TODO: https://github.com/tusharmath/node-config-ts/issues/63
	config.database.username = process.env.DB_USER ?? "";
	config.database.host = process.env.DB_HOST ?? "";
	config.database.password = process.env.DB_PASS ?? "";
	config.database.database = process.env.DB_DATABASE ?? "";
	config.bot.token = process.env.DISCORD_TOKEN ?? "";
}

export const client = new MystBotClient({
	messageEditHistoryMaxSize: 0,
	presence: {
		status: "online",
		activity: {
			type: "LISTENING",
			name: `${config.bot.prefix}help`,
		},
	},
	subCommands: {
		overlappedPreconditions: ["Cooldown"],
	},
	logger: {
		instance: LoggerFactory.get(MystBotClient),
		level:
			LoggerFactory.get(MystBotClient).level ?? config.general.debug
				? LogLevel.Debug
				: LogLevel.Info,
	},
	fetchPrefix: async (message: Message) =>
		getPrefixWithPriority(message.guild?.id),
	// TODO when high-load: Design intents
	// https://discordjs.guide/popular-topics/intents.html
	// ws: {
	//   intents: new Intents(["GUILD_MESSAGES", "GUILDS"]),
	// },
});

async function bootstrap(): Promise<void> {
	// Load environment variables
	dotenv.config({
		debug: config.general.debug,
	});

	bindEnvVars(config);

	// Cache init
	CacheManager.setOptions({
		excludeContext: false,
		debug: config.general.debug,
	});
	CacheManager.setClient(new NodeCacheAdapter(new NodeCache()));

	LoggerFactory.get(MystBotClient).info(
		"Logger level: %s",
		LoggerFactory.get(MystBotClient).level
	);

	// Bindings
	Container.bind(GuildService);
	Container.bind(SettingService);
	Container.bind(EventBus);
	Container.bind(PermissionsManager);

	await bindSubscribers([LevelUpSubscriber]).then((ctors) =>
		ctors.map((subscriber) =>
			// Init classes to load event handlers
			Container.get<typeof subscriber>(subscriber)
		)
	);

	process.on("SIGINT", processExit);
	process.on("SIGTERM", processExit);
}

async function bindSubscribers(
	subscribers: { new (): Subscriber<BusinessEvent> }[]
) {
	try {
		for (const subscriberClass of subscribers) {
			Container.bind(subscriberClass)
				.to(MystBotClient)
				.scope(Scope.Singleton);
		}
	} catch (e) {
		LoggerFactory.get(MystBotClient).error(e);
	}
	return Promise.resolve(subscribers);
}

async function processExit() {
	const levelingManager = Container.get(LevelingManager);

	await levelingManager.flushAll().then(() => {
		LoggerFactory.get(MystBotClient).info("Experience buffer was flushed!");
		process.exit();
	});
}

void bootstrap().then(async () => {
	try {
		client.database = await getDatabase();
		await client.login(config.bot.token ?? "");
		LoggerFactory.get(MystBotClient).info(
			">>> Bot successfully started up!"
		);
	} catch (e) {
		LoggerFactory.get(MystBotClient).error(e);
	}
});
