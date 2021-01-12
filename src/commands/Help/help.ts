import { Message, MessageEmbed } from "discord.js";
import { config } from "node-config-ts";
import { ApplyOptions } from "@sapphire/decorators";
import { Args, BucketType, CommandOptions } from "@sapphire/framework";
import { MystCommand } from "../../lib/structures/MystCommand";
import type { Category } from "../../lib/MystBotClient";

export type CommandsByCategories = {
	[K in Category]?: string[];
};

type TCategoryIcons = { [K in Category]?: string };

const CategoryIcons: TCategoryIcons = {
	Economy: ":moneybag:",
	Guild: ":busts_in_silhouette:",
	Misc: ":roll_of_paper:",
};

@ApplyOptions<CommandOptions>({
	name: "help",
	description: "Gets a commands and whole usage info",
	preconditions: [
		{
			name: "Cooldown",
			context: {
				bucketType: BucketType.Guild,
				delay: config.bot.commandCoolDown,
			},
		},
	],
	usages: "help [command]",
	category: "Misc",
})
export class HelpCommand extends MystCommand {
	public async run(message: Message, args: Args) {
		const { commands } = message.client;
		const soughtCommand = await args.pickResult("string");

		let validCommandName: string | undefined = undefined;
		if (soughtCommand.success) {
			validCommandName = soughtCommand.value;
		}

		const commandToDisplay = commands.find(
			(cmd) => cmd.name === validCommandName
		) as MystCommand;

		const messageEmbed = new MessageEmbed()
			.setColor("PURPLE")
			.setAuthor(
				`${config.bot.name}'s help panel`,
				message.client.user?.avatarURL() ?? undefined
			);

		if (commandToDisplay) {
			const prefix = await message.client.fetchPrefix(message);

			messageEmbed
				.setTitle(
					`**${prefix}${
						commandToDisplay.usages ?? commandToDisplay.name
					}**`
				)
				.setFooter("Args tip: < > - required, [ ] - non-required");

			commandToDisplay.description &&
				messageEmbed.setDescription(
					`\`\`\`${commandToDisplay.description}\`\`\``
				);

			commandToDisplay.aliases.length &&
				messageEmbed.addField(
					":small_orange_diamond: Aliases",
					commandToDisplay.aliases.map((v) => `\`${v}\``).join(" ") ??
						"*none*",
					true
				);

			const usageList = commandToDisplay.subCommands
				.map((subCommand) => {
					const subcommandInstance = commands.get(
						subCommand.command ?? ""
					);
					if (subcommandInstance)
						return `\`${prefix}${subcommandInstance.usages}\`\n${subcommandInstance.description}\n`;
					return undefined;
				})
				.filter((e) => e)
				.join("\n");
			usageList &&
				messageEmbed.addField(
					":small_orange_diamond: Usages list",
					usageList
				);
		} else {
			const commandsByCategories: CommandsByCategories = {};
			const prefix = await message.client.fetchPrefix(message);

			messageEmbed.setDescription(
				`Use \`${prefix}help [command]\` to get more help about some command!
        \n *Example* : \`${prefix}help coins\``
			);

			for (const c of commands.array()) {
				if ((c as MystCommand).isSubcommand) continue;

				commandsByCategories[c.category as Category] ??= [];

				if (
					commandsByCategories[c.category as Category]?.includes(
						c.name
					)
				)
					continue;
				commandsByCategories[c.category as Category]?.push(c.name);
			}

			for (const category of Object.keys(commandsByCategories)) {
				messageEmbed.addField(
					`${CategoryIcons[category as Category] ?? ""} ${category}`,
					(commandsByCategories[category as Category] ?? []).join(
						" "
					),
					true
				);
			}
		}

		return message.channel.send({ embed: messageEmbed });
	}
}
