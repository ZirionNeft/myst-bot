import { Snowflake, TextChannel } from "discord.js";
import GuildService from "../services/GuildService";
import { Container } from "typescript-ioc";
import { config } from "node-config-ts";
import App from "../App";
import LoggerFactory from "./LoggerFactory";

export default class BotHelpers {
  static async getPrefixWithPriority(guildId?: Snowflake | null) {
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

    const guildEntity = await guildService.findOne(guildId);
    const discordGuild = App.Client.guilds.cache.get(guildId);

    const channel = guildEntity?.infoChannelId
      ? discordGuild?.channels.cache.get(guildEntity.infoChannelId)
      : discordGuild?.systemChannel;
    if (channel) return channel as TextChannel;
  }

  /**
   * Return true (early) if any of the provided Promises are true
   * @param {Function(arg: *): Boolean} predicate The test the resolved Promise value must pass to be considered true
   * @param {Promise[]} promises The Promises to wait on
   * @returns {Promise<Boolean>} Whether one of the the provided Promises passed the predicate
   */
  static async promiseSome(
    promises: Promise<boolean>[],
    predicate: (...args: boolean[]) => boolean = (...args: boolean[]) => args[0]
  ): Promise<boolean> {
    while (promises.length) {
      // Give all our promises IDs so that we can remove them when they are done
      const arrWithIDs = promises.map((p, idx) =>
        p
          .then((data) => ({ idx, data }))
          .catch((_err) => ({ idx, data: false }))
      );
      // Wait for one of the Promises to resolve
      const soon = await Promise.race(arrWithIDs);
      // If it passes the test, we're done
      if (predicate(soon.data)) return true;
      // Otherwise, remove that Promise and race again
      promises.splice(soon.idx, 1);
    }
    return false;
  }
}
