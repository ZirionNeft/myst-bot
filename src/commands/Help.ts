import {Command, CommandMessage, Rule, Rules} from "@typeit/discord";
import {RichEmbed} from 'discord.js';
import {helpRecords} from '../misc/helpRecords';
import {HelpRecordItem} from "../misc";

const aliases = [
    "справка", "помощь", "помогите", "памагити",
    "аааблять", "чтоделать", "команды", "помощ",
    "помосч", "хелп", "хелб",
    "хлеб", "халтура", "бот", "ботчтоумееш",
    "какотправитьлайк", "язапустался", "вишнялох", "обучение",
    "каманды", "функции", "информация", "инфо"
];

export abstract class Help {

    @Command("help")
    @Rules(Rule(aliases.join('|')).end())
    async help(command: CommandMessage) {

        const content = Object.values(helpRecords).map(
            (r: HelpRecordItem): string => `\`${r.name}\` - ${r.desc}`
        ).join('\n');

        const messageEmbed = new RichEmbed()
            .setColor("BLUE")
            .addField("Список Команд", content);

        return await command.channel.send({embed: messageEmbed});
    }
}