import * as dotenv from "dotenv";
import App from "./App";
import CacheManager from "@type-cacheable/core";
import { NodeCacheAdapter } from "@type-cacheable/node-cache-adapter";
import NodeCache from "node-cache";
import { config } from "node-config-ts";

// TODO: https://github.com/tusharmath/node-config-ts/issues/63
config.database.username = "test";

// Load environment variables
dotenv.config({
  debug: config.general.debug,
});

// Cache init
CacheManager.setOptions({
  excludeContext: false,
  debug: config.general.debug,
});
CacheManager.setClient(new NodeCacheAdapter(new NodeCache()));

App.start();
