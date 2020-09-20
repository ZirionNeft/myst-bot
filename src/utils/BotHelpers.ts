import { Cacheable } from "@type-cacheable/core";
import { Snowflake, TextChannel } from "discord.js";
import GuildService from "../services/GuildService";
import { Container } from "typescript-ioc";
import { config } from "node-config-ts";
import App from "../App";

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

  static async getGuildInfoChannel(
    guildId: Snowflake
  ): Promise<TextChannel | undefined> {
    const guildService: GuildService = Container.get(GuildService);

    const guildEntity = await guildService.findOneOrCreate(guildId);
    const discordGuild = App.Client.guilds.cache.get(guildId);

    const channel = guildEntity.infoChannelId
      ? discordGuild?.channels.cache.get(guildEntity.infoChannelId)
      : discordGuild?.systemChannel;
    if (channel) return channel as TextChannel;
  }
}
