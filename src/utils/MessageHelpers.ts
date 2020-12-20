import {
  EmbedFieldData,
  GuildMember,
  MessageEmbed,
  Snowflake,
  TextChannel,
  User,
} from "discord.js";
import ChatCleaner from "../logic/ChatCleaner";
import { config } from "node-config-ts";
import BotHelpers from "./BotHelpers";
import { Message } from "discord.js";

export abstract class MessageHelpers {
  static async sendSystemErrorDM(
    member: GuildMember | User,
    data?: EmbedFieldData[]
  ) {
    const s = `https://discord.gg/${config.bot.supportGuild}`;
    const messageEmbed = new MessageEmbed();

    data &&
      messageEmbed.addFields(data.map((v) => ({ ...v, ...{ inline: true } })));

    return (await member?.createDM())?.send(
      messageEmbed
        .setColor("RED")
        .setTitle("I'M SORRY! But...")
        .setDescription(
          "```...something went wrong. Please, contact with us support to prevent the same situations in future! Thanks!```"
        )
        .addField("Support server", s, true)
        .addField("Timestamp", Date.now(), true)
        .addField(
          "Guild",
          member instanceof GuildMember
            ? `${member?.guild.name}\n<${member?.guild.id}>`
            : "[none]",
          true
        )
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

  static async sendInInfoChannel(
    guildId: Snowflake,
    message: string | MessageEmbed
  ): Promise<void> {
    await (await BotHelpers.getGuildInfoChannel(guildId))?.send(message);
  }

  static async sendPublicNote(message: Message, text: string) {
    return this.sendAndDelete(
      message,
      `**${message.author.username}**, ${text}`,
      12
    );
  }

  static async sendAndDelete(
    message: Message,
    text: string,
    deleteDelay?: number
  ) {
    return message.channel
      .send(text)
      .then((m) => ChatCleaner.clean({ message: m, sec: deleteDelay }));
  }
}
