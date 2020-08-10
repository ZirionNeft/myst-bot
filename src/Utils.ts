import {
  EmbedFieldData,
  GuildMember,
  MessageEmbed,
  Snowflake,
  StringResolvable,
  TextChannel,
} from "discord.js";
import process from "process";
import GuildService from "./services/GuildService";
import { Container } from "typescript-ioc";
import { Cacheable } from "@type-cacheable/core";
import { CommandMessage } from "@typeit/discord";

export interface InfoField {
  name: string;
  value: string;
}

export abstract class Utils {
  static async sendSystemErrorDM(member: GuildMember, data?: EmbedFieldData[]) {
    const s = `https://discord.gg/${process.env.BOT_SUPPORT_SERVER}`;
    const m = new MessageEmbed();

    data && m.addFields(data.map((v) => ({ ...v, ...{ inline: true } })));

    return (await member?.createDM())?.send(
      m
        .setColor("RED")
        .setTitle("I'M SORRY! But...")
        .setDescription(
          "```...something went wrong. Please, contact with us support to prevent the same situations in future! Thanks!```"
        )
        .addField("Support server", s, true)
        .addField("Timestamp", Date.now(), true)
        .addField("Guild", `${member?.guild.name}\n<${member?.guild.id}>`, true)
        .setURL(s)

      // TODO: leave check Reaction to send data about error to support
      //.setFooter("Accident has been reported automatically")
    );
  }

  static async sendPublicError(
    channel: TextChannel,
    message?: string,
    title?: string
  ) {
    return channel.send(
      new MessageEmbed()
        .setColor("DARK_RED")
        .setTitle(title ?? "Oops! There's an Error")
        .setDescription(`\`${message}\``)
    );
  }

  static async sendPublicNote(commandMessage: CommandMessage, message: string) {
    return commandMessage.channel.send(
      `<:o:742022518277144647> **${commandMessage.author.username}**, ${message}`
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
