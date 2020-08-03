import { Client, Command, CommandMessage, Infos } from "@typeit/discord";
import { MessageEmbed } from "discord.js";
import * as process from "process";

export type CommandsByCategories = {
  [P in Category]?: string[];
};

export abstract class Help {
  @Command("help :hcommand")
  @Infos<CommandInfo>({
    description: "Gets a commands and whole usage info",
    category: "Other",
    coreCommand: true,
    usages: "help [command]",
  })
  async runHelp(command: CommandMessage) {
    const { hcommand }: { hcommand: string } = command.args;

    const commands = Client.getCommands<CommandInfo>();
    const messageEmbed = new MessageEmbed()
      .setColor("PURPLE")
      .setAuthor(
        `${process.env.BOT_NAME}'s help panel`,
        command.client.user?.avatarURL() ?? undefined
      );

    if (hcommand) {
      const filteredCommands = commands.filter(
        (cmd) => cmd.infos.usages.split(" ")[0] === hcommand
      );

      if (!filteredCommands.length) {
        return await command.channel.send(
          `**${command.author.username}**, command *${hcommand}* not found!`
        );
      }

      const prefix = filteredCommands[0].prefix;
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
          filteredCommands[0].infos.category,
          true
        )
        .addField(":small_orange_diamond: Aliases", "*none*", true);

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
          category,
          cmdByCategories[category].join(" "),
          true
        );
      }
    }

    return await command.channel.send({ embed: messageEmbed });
  }
}
