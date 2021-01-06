import { Message, MessageEmbed } from "discord.js";
import { Inject } from "typescript-ioc";
import { config } from "node-config-ts";
import { ApplyOptions } from "@sapphire/decorators";
import { Args, BucketType } from "@sapphire/framework";
import { Category, MystCommandOptions } from "mystbot";
import { MystCommand } from "../../lib/structures/MystCommand";
import UserService from "../../lib/services/UserService";
import BotHelpers from "../../lib/utils/BotHelpers";

export type CommandsByCategories = {
  [key in Category]?: string[];
};

const CATEGORY_ICON: { [P in Category]?: string } = {
  Economy: ":moneybag:",
  Guild: ":busts_in_silhouette:",
  Misc: ":roll_of_paper:",
};

@ApplyOptions<MystCommandOptions>({
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
export default class HelpCommand extends MystCommand {
  @Inject
  private _userService!: UserService;

  public async run(message: Message, args: Args) {
    const commands = message.client.commands;
    const hcommand = await args.pickResult("string");

    let validCommandName;
    if (hcommand.success) {
      validCommandName = hcommand.value;
    }

    const messageEmbed = new MessageEmbed()
      .setColor("PURPLE")
      .setAuthor(
        `${config.bot.name}'s help panel`,
        message.client.user?.avatarURL() ?? undefined
      );

    const commandToDisplay = commands.find(
      (cmd) => cmd.name === validCommandName
    ) as MystCommand;

    if (commandToDisplay) {
      const prefix = await BotHelpers.getPrefixWithPriority(message.guild?.id);

      messageEmbed
        .setTitle(
          `**${prefix}${commandToDisplay.usages ?? commandToDisplay.name}**`
        )
        .setFooter("Args tip: < > - required, [ ] - non-required");

      commandToDisplay.description &&
        messageEmbed.setDescription(
          `\`\`\`${commandToDisplay.description}\`\`\``
        );

      commandToDisplay.aliases.length &&
        messageEmbed.addField(
          ":small_orange_diamond: Aliases",
          commandToDisplay.aliases.map((v) => `\`${v}\``).join(" ") ?? "*none*",
          true
        );

      const usageList = commandToDisplay.subCommands
        .map((subCommand) => {
          const subcommandInstance = commands.get(subCommand.command ?? "");
          if (subcommandInstance)
            return `\`${prefix}${subcommandInstance.usages}\`\n${subcommandInstance.description}\n`;
          return undefined;
        })
        .filter((e) => e)
        .join("\n");
      usageList &&
        messageEmbed.addField(":small_orange_diamond: Usages list", usageList);
    } else {
      const commandsByCategories: CommandsByCategories = {};
      const prefix = message.client.fetchPrefix(message);

      messageEmbed.setDescription(
        `Use \`${prefix}help [command]\` to get more help about some command!
        \n *Example* : \`${prefix}help coins\``
      );

      for (const c of commands.array()) {
        if ((c as MystCommand).isSubcommand) continue;

        !commandsByCategories[c.category] &&
          (commandsByCategories[c.category] = []);

        if (commandsByCategories[c.category]?.includes(c.name)) continue;
        commandsByCategories[c.category]?.push(c.name);
      }

      for (const category of Object.keys(commandsByCategories)) {
        messageEmbed.addField(
          `${CATEGORY_ICON[category] ?? ""} ${category}`,
          commandsByCategories[category].join(" "),
          true
        );
      }
    }

    return await message.channel.send({ embed: messageEmbed });
  }
}
