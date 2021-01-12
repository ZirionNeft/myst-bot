import type { Message, NewsChannel } from "discord.js";
import { Inject } from "typescript-ioc";
import { config } from "node-config-ts";
import { ApplyOptions } from "@sapphire/decorators";
import { BucketType, CommandOptions, UserError } from "@sapphire/framework";
import { MystCommand } from "../../lib/structures/MystCommand";
import UserService from "../../lib/services/UserService";
import { FieldsEmbed } from "discord-paginationembed";
import type { UserModel } from "../../lib/database/models";
import { calculateNextLevelXp } from "../../lib/structures/GuildLevelingFactory";

const EXP_ICON = "https://icon-library.com/images/score-icon/score-icon-21.jpg";

@ApplyOptions<CommandOptions>({
	name: "top",
	aliases: ["leaderboard", "lb"],
	description: "Guild leaderboard by levels and experience",
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
	usages: "top",
	category: "Guild",
})
export class TopCommand extends MystCommand {
	@Inject
	private _userService!: UserService;

	public async run(message: Message) {
		if (!message.guild?.id)
			throw new UserError("GuildIdError", "Guild id is not found");

		const memberModels = await this._userService.getUsersLeveling(
			message.guild.id
		);

		const coinsTopEmbed = new FieldsEmbed<UserModel>();

		coinsTopEmbed.embed
			.setAuthor("Experience leaderboard", EXP_ICON)
			.setColor("#FFFFFF");

		return coinsTopEmbed
			.setAuthorizedUsers([message.author.id])
			.setChannel(
				message.channel as Exclude<typeof message.channel, NewsChannel>
			)
			.setClientAssets({ prompt: "{{user}}, pick a number of page!" })
			.setArray(memberModels)
			.setElementsPerPage(15)
			.setPageIndicator(false)
			.formatField("User", (el) => `<@${el.userId}>`)
			.formatField("Level", (el) => `\`${el.level}\``)
			.formatField(
				"Exp.",
				(el) => `\`${el.experience}/${calculateNextLevelXp(el.level)}\``
			)
			.setPage(1)
			.setTimeout(60000)
			.setNavigationEmojis({
				back: "◀",
				jump: "↗",
				forward: "▶",
				delete: "🗑",
			})
			.build();
	}
}
