import {
  EmbedFieldData,
  GuildMember,
  MessageEmbed,
  Snowflake,
  TextChannel,
} from "discord.js";
import process from "process";
import { CommandMessage } from "@typeit/discord";

export abstract class MessageHelpers {
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

  static async getUserIdFromMention(
    mention: string
  ): Promise<Snowflake | undefined> {
    if (!mention) return undefined;

    if (mention.startsWith("<@") && mention.endsWith(">")) {
      mention = mention.slice(2, -1);

      if (mention.startsWith("!")) {
        mention = mention.slice(1);
      }

      return mention;
    }
    return undefined;
  }

  static capitalize(s: string | undefined): string | undefined {
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : undefined;
  }
}
