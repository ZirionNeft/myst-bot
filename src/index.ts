import * as dotenv from "dotenv";
import App from "./App";
import CacheManager from "@type-cacheable/core";
import { NodeCacheAdapter } from "@type-cacheable/node-cache-adapter";
import NodeCache from "node-cache";

const DEBUG = process.env.DEBUG === "true";

// Load environment variables
dotenv.config({
  debug: DEBUG,
});

// Cache init
CacheManager.setOptions({
  excludeContext: false,
  debug: DEBUG,
});
CacheManager.setClient(new NodeCacheAdapter(new NodeCache()));

App.start();
