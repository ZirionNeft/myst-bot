import { Message, MessageEmbed, TextChannel } from "discord.js";
import { Inject } from "typescript-ioc";
import { config } from "node-config-ts";
import { ApplyOptions } from "@sapphire/decorators";
import { BucketType, CommandOptions, UserError } from "@sapphire/framework";
import { MystCommand } from "../../lib/structures/MystCommand";
import EmojiService from "../../lib/services/EmojiService";
import { Embeds } from "discord-paginationembed";

@ApplyOptions<CommandOptions>({
	name: "emoji",
	description: "Shows usages count of every custom emoji on guild",
	preconditions: [
		"GuildOnly",
		{
			name: "Cooldown",
			context: {
				bucketType: BucketType.Guild,
				delay: config.bot.commandCoolDown,
			},
		},
	],
	usages: "emoji",
	category: "Guild",
})
export class EmojiCommand extends MystCommand {
	@Inject
	private emojiService!: EmojiService;

	public async run(message: Message) {
		if (!message.guild) return;

		const statEmoji = (
			await this.emojiService.guildScoped(message.guild.id)
		).map((e) => {
			const data = e.get();
			return {
				id: data.emojiId,
				counter: data.counter,
			};
		});
		const guildEmoji = message.guild.emojis.cache.map((e) => ({
			name: e.name,
			id: e.id,
			counter: statEmoji.find((s) => s.id === e.id)?.counter ?? 0,
			animated: e.animated,
		}));

		if (!guildEmoji.length)
			throw new UserError(
				"EmojiResultEmptyError",
				"There is no emojis in the guild."
			);

		const embeds: MessageEmbed[] = [];
		const emojiPerPage = 24;
		for (let i = 0; i < guildEmoji.length; i += emojiPerPage) {
			embeds.push(
				new MessageEmbed().addFields(
					guildEmoji.slice(i, i + emojiPerPage).map((d) => ({
						name: `<${d.animated ? "a" : ""}:${d.name}:${d.id}>`,
						value: `**${d.counter}**`,
						inline: true,
					}))
				)
			);
		}

		const paginatedEmbeds = new Embeds()
			.setArray(embeds)
			.setChannel(message.channel as TextChannel)
			.setColor("NAVY")
			.setTitle("Emoji Usage [Guild Only]")
			.setAuthorizedUsers([message.author.id]);

		return paginatedEmbeds.build();
	}
}
