import * as dotenv from "dotenv";
import App from "./App";
import CacheManager from "@type-cacheable/core";
import { NodeCacheAdapter } from "@type-cacheable/node-cache-adapter";
import NodeCache from "node-cache";
import { config } from "node-config-ts";

// Load environment variables
dotenv.config({
  debug: config.general.debug,
});

// TODO: https://github.com/tusharmath/node-config-ts/issues/63
config.database.username = process.env.DB_USER ?? "";
config.database.host = process.env.DB_HOST ?? "";
config.database.password = process.env.DB_PASS ?? "";
config.database.database = process.env.DB_DATABASE ?? "";
config.bot.token = process.env.DISCORD_TOKEN ?? "";

// Cache init
CacheManager.setOptions({
  excludeContext: false,
  debug: config.general.debug,
});
CacheManager.setClient(new NodeCacheAdapter(new NodeCache()));

App.start();
