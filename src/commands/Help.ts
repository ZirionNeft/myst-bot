import { Command, CommandMessage } from "@typeit/discord";
import { MessageEmbed } from "discord.js";
import helpRecords from "../../config/help_info.json";
import BaseCommand from "./BaseCommand";
import { Aliases } from "../misc/decorators/Aliases";

export interface HelpRecordItem {
  desc: string;
  name: string;
}

export type HelpRecords = Record<string, HelpRecordItem>;

export abstract class Help extends BaseCommand {
  protected static _aliases = [
    "справка",
    "помощь",
    "помогите",
    "памагити",
    "чтоделать",
    "команды",
    "помощ",
    "помосч",
    "хелп",
    "хелб",
    "хлеб",
    "халтура",
    "бот",
    "ботчтоумееш",
    "какотправитьлайк",
    "обучение",
    "каманды",
    "функции",
    "информация",
    "инфо",
  ];

  @Command("help")
  @Aliases(Help._aliases)
  async runHelp(command: CommandMessage) {
    const content = Object.values(helpRecords as HelpRecords)
      .map((r: HelpRecordItem): string => `\`${r.name}\` - ${r.desc}`)
      .join("\n");

    const messageEmbed = new MessageEmbed()
      .setColor("BLUE")
      .addField("Список Команд", content);

    return await command.channel.send({ embed: messageEmbed });
  }
}
