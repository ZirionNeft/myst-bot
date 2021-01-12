import {
	EmbedFieldData,
	GuildMember,
	Message,
	MessageEmbed,
	Snowflake,
	TextChannel,
	User,
} from "discord.js";
import ChatCleaner from "../structures/ChatCleaner";
import { config } from "node-config-ts";
import { getGuildInfoChannel } from "./BotHelpers";

// TODO: Refactor class to const functions instead static class

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export abstract class MessageHelpers {
	public static async sendSystemErrorDM(
		member: GuildMember | User,
		data?: EmbedFieldData[]
	) {
		const s = `https://discord.gg/${config.bot.supportGuild}`;
		const messageEmbed = new MessageEmbed();

		data &&
			messageEmbed.addFields(
				data.map((v) => ({ ...v, ...{ inline: true } }))
			);

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
			// .setFooter("Accident has been reported automatically")
		);
	}

	public static async sendPublicError(
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

	public static async sendInInfoChannel(
		guildId: Snowflake,
		message: string | MessageEmbed
	): Promise<void> {
		await (await getGuildInfoChannel(guildId))?.send(message);
	}

	public static async sendPublicNote(message: Message, text: string) {
		return this.sendAndDelete(
			message,
			`**${message.author.username}**, ${text}`,
			12
		);
	}

	public static async sendAndDelete(
		message: Message,
		text: string,
		deleteDelay?: number
	) {
		return message.channel
			.send(text)
			.then((m) => ChatCleaner.clean({ message: m, sec: deleteDelay }));
	}
}
