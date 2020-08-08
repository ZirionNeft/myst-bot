import { Client, Command, CommandMessage, Guard, Infos } from "@typeit/discord";
import { MessageEmbed } from "discord.js";
import * as process from "process";
import { NotBot, ThrottleMessage } from "../guards";
import { Utils } from "../Utils";

export type CommandsByCategories = {
  [P in Category]?: string[];
};

const CATEGORY_ICON: { [P in Category]?: string } = {
  Economy: ":moneybag:",
  Guild: ":busts_in_silhouette:",
  Other: ":roll_of_paper:",
};

export abstract class Help {
  @Command("help :hcommand")
  @Infos<CommandInfo>({
    description: "Gets a commands and whole usage info",
    category: "Other",
    coreCommand: true,
    usages: "help [command]",
  })
  @Guard(NotBot(), ThrottleMessage())
  async runHelp(command: CommandMessage) {
    const { hcommand }: { hcommand: string } = command.args;

    const commands = Client.getCommands<CommandInfo>();
    const messageEmbed = new MessageEmbed()
      .setColor("PURPLE")
      .setAuthor(
        `${process.env.BOT_NAME}'s help panel`,
        command.client.user?.avatarURL() ?? undefined
      );

    const filteredCommands = hcommand
      ? commands.filter((cmd) => cmd.infos.usages.split(" ")[0] === hcommand)
      : null;

    if (filteredCommands && filteredCommands.length) {
      const prefix = Utils.getGuildPrefix(command.guild?.id);
      const coreCommand = filteredCommands.find((v) => v.infos.coreCommand);

      messageEmbed
        .setTitle(`**${prefix}${coreCommand?.infos.usages ?? hcommand}**`)
        .setDescription(
          `\`\`\`${
            coreCommand?.infos.description ?? "- no description -"
          }\`\`\``
        )
        .setFooter("Args tip: < > - required, [ ] - non-required")
        .addField(
          ":small_orange_diamond: Category",
          `${CATEGORY_ICON[filteredCommands[0].infos.category] ?? ""} ${
            filteredCommands[0].infos.category
          }`,
          true
        )
        .addField(
          ":small_orange_diamond: Aliases",
          coreCommand?.infos.aliases?.map((v) => `\`${v}\``).join(" ") ??
            "*none*",
          true
        );

      const usageList = filteredCommands
        .filter((v) => !v.infos.coreCommand)
        .map((v) => `\`${prefix}${v.infos.usages}\`\n${v.description}\n`)
        .join("\n");
      if (usageList) {
        messageEmbed.addField(":small_orange_diamond: Usages list", usageList);
      }
    } else {
      const cmdByCategories: CommandsByCategories = {};

      messageEmbed.setDescription(
        `Use \`${process.env.COMMAND_PREFIX}help [command]\` to get more help about some command!
        \n *Example* : \`${process.env.COMMAND_PREFIX}help coins\``
      );

      for (let c of commands) {
        if (!c.infos.coreCommand) continue;

        const formattedCoreCommand = `\`${c.infos.usages.split(" ")[0]}\``;

        if (!cmdByCategories[c.infos.category])
          cmdByCategories[c.infos.category] = [];

        if (cmdByCategories[c.infos.category]?.includes(formattedCoreCommand))
          continue;
        cmdByCategories[c.infos.category]?.push(formattedCoreCommand);
      }

      for (let category of Object.keys(cmdByCategories)) {
        messageEmbed.addField(
          `${CATEGORY_ICON[category] ?? ""} ${category}`,
          cmdByCategories[category].join(" "),
          true
        );
      }
    }

    return await command.channel.send({ embed: messageEmbed });
  }
}
