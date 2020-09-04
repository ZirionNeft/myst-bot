import { Cacheable } from "@type-cacheable/core";
import { Snowflake } from "discord.js";
import GuildService from "../services/GuildService";
import { Container } from "typescript-ioc";
import process from "process";
import { config } from "node-config-ts";

export default abstract class BotHelpers {
  // TODO: clearing cache when prefix has updated
  @Cacheable({ cacheKey: (args: any[]) => args[0], ttlSeconds: 900 })
  static async getGuildPrefix(guildId: Snowflake | undefined | null) {
    const guildService: GuildService = Container.get(GuildService);
    return (
      (guildId ? await guildService.findOne(guildId) : undefined)?.prefix ??
      config.bot.prefix ??
      "m!"
    );
  }
}
