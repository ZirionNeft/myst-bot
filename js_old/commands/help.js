const Discord = require("discord.js");
const help = require("../json/help.json");
const utils = require("../extra_modules/utils.js");

module.exports.only_bot_channel = true;

module.exports.run = async (bot, message, cmd, args) =>
{
    let embed = new Discord.RichEmbed().setColor("#FFFFFF");
    let list = "";

    help.commands.forEach(command =>
    {
        list += `\`${command.name}\` - ${command.desc}\n`;
    });

    embed.addField("Список Команд", list);

    utils.SendMessage(bot, message.channel, embed);
}

module.exports.help = {
    name: ["справка", "помощь", "помогите", "памагити", "аааблять", "чтоделать", "команды",
        "помощ", "помосч", "help", "хелп", "хелб", "хлеб", "халтура", "бот", "ботчтоумееш",
        "какотправитьлайк", "язапустался", "вишнялох", "обучение", "каманды", "функции", "информация", "инфо"]
}