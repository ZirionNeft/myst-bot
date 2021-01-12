import type { Message } from "discord.js";
import { Inject } from "typescript-ioc";
import { config } from "node-config-ts";
import { ApplyOptions } from "@sapphire/decorators";
import {
	Args,
	BucketType,
	CommandOptions,
	UserError,
} from "@sapphire/framework";
import UserService from "../../../lib/services/UserService";
import { MystCommand } from "../../../lib/structures/MystCommand";
import { client } from "../../../Myst";

const COINS_EMOJI = config.bot.currencyEmoji;

@ApplyOptions<CommandOptions>({
	description: "Allows you to give some coins to mentioned member",
	usages: "coins give <@member> <amount>",
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
	category: "Economy",
})
export class CoinsGiveSubcommand extends MystCommand {
	@Inject
	private userService!: UserService;

	public async run(message: Message, args: Args) {
		const target = await args.pickResult("member");
		if (!target.success)
			throw new UserError(
				"CoinsGiveArgumentFirstError",
				"You must specify a member and amount of coins, and the first one did not match."
			);

		const transferredCoins = await args.pickResult("integer", {
			minimum: 1,
		});
		if (!transferredCoins.success)
			throw new UserError(
				"CoinsGiveArgumentSecondError",
				"You must specify a member and amount of coins, and the second one did not match."
			);

		const amount = transferredCoins.value;
		const contextGuildId = message.guild?.id;

		if (!target.value?.id)
			throw new UserError(
				"CoinsGiveTargetNotFoundError",
				"Target user not found!"
			);

		if (!contextGuildId)
			throw new UserError("GuildIdError", "Guild id is not found");

		const targetModelInstance = await this.userService.findOneOrCreate(
			target.value.id,
			contextGuildId
		);
		const authorModelInstance = await this.userService.findOne(
			message.author.id,
			contextGuildId
		);

		if (!authorModelInstance || authorModelInstance.coins < amount)
			throw new UserError(
				"CoinsGiveNotEnoughError",
				"You are not rich enough to give so many coins"
			);

		if (message.author.id === target.value.id)
			throw new UserError(
				"CoinsGiveSelfGivingError",
				"You cannot give coins to yourself"
			);

		await client.database.sequelize.transaction(async (t) =>
			Promise.all([
				this.userService.update(
					authorModelInstance.userId,
					contextGuildId,
					{ coins: authorModelInstance.coins - amount },
					t
				),
				this.userService.update(
					targetModelInstance.userId,
					contextGuildId,
					{ coins: Number(targetModelInstance.coins) + amount },
					t
				),
			])
		);

		return message.channel.send(
			`**${message.author.username}** sends to **${target.value.user.username}** ${amount} Coins ${COINS_EMOJI}`
		);
	}
}
