import {
  EmbedFieldData,
  GuildMember,
  MessageEmbed,
  TextChannel,
  User,
} from "discord.js";
import { CommandMessage } from "@typeit/discord";
import ChatCleaner from "../logic/ChatCleaner";
import { config } from "node-config-ts";

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

  static async sendPublicNote(commandMessage: CommandMessage, message: string) {
    return this.sendAndDelete(
      commandMessage,
      `**${commandMessage.author.username}**, ${message}`,
      10
    );
  }

  static async sendAndDelete(
    commandMessage: CommandMessage,
    message: string,
    deleteDelay?: number
  ) {
    return commandMessage.channel
      .send(message)
      .then((m) => ChatCleaner.clean({ message: m, sec: deleteDelay }));
  }
}
