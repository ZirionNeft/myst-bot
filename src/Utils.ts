import { GuildMember, MessageEmbed, Snowflake } from "discord.js";
import process from "process";
import GuildService from "./services/GuildService";
import { Container } from "typescript-ioc";
import { Cacheable } from "@type-cacheable/core";

export abstract class Utils {
  // TODO: add log info: user, cmd, error date, guild
  static async sendSystemErrorDM(member: GuildMember) {
    return (await member.createDM())?.send(
      new MessageEmbed()
        .setColor("RED")
        .setTitle("I'M SORRY! But...")
        .setDescription(
          "...something went wrong. Please, contact with us support to prevent the same situations in future! Thanks!"
        )
        .setURL(`https://discord.gg/${process.env.BOT_SUPPORT_SERVER}`)
    );
  }

  // TODO: clearing cache when prefix has updated
  @Cacheable({ cacheKey: (args: any[]) => args[0], ttlSeconds: 900 })
  static async getGuildPrefix(guildId: Snowflake | undefined | null) {
    const guildService: GuildService = Container.get(GuildService);
    return (
      (guildId ? await guildService.findOne(guildId) : undefined)?.prefix ??
      process.env.COMMAND_PREFIX ??
      "!"
    );
  }
}
