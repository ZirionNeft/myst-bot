const Discord = require("discord.js");
const utils = require("../extra_modules/utils.js");

module.exports.only_bot_channel = false;

module.exports.run = async (bot, message, cmd, args) =>
{
    args = args.join(" ");
    let sepInd = args.indexOf(":");

    if (sepInd == -1)
    {
        let embed = new Discord.RichEmbed()
            .setAuthor("Как создавать опрос?", "https://wmpics.pics/upload/smallthumbs/H7SA.png")
            .setDescription("Создайте опрос по такой форме:\n```!опрос название : варианты; ответа ; через;точку с запятой```И бот автоматически создаст опрос, добавив к нему реакции для голосования ;)\n\nP.S. Расставлять пробелы не обязательно")
            .setColor("#FFFFFF");

        return utils.SendMessage(bot, message.channel, embed);
    }

    let name = args.slice(0, sepInd).trim();
    name = name.charAt(0).toUpperCase() + name.slice(1);
    let desc = args.slice(sepInd + 1).trim();
    if (desc[desc.length - 1] == ";") { desc = desc.slice(0, desc.length - 1); }
    desc = desc.split(";");
    let descfinale = "";

    let asnwerCount = 0;
    desc.forEach(function (element)
    {
        let asnwer = element.trim();
        asnwer = asnwer.charAt(0).toUpperCase() + asnwer.slice(1);
        descfinale += `${++asnwerCount}. ${asnwer}\n`
    });

    let embed = new Discord.RichEmbed()
        .setAuthor(name, message.author.avatarURL)
        .setDescription(descfinale)
        .setColor("#FFFFFF");

    let opros = await utils.SendMessage(bot, message.channel, embed);

    if (asnwerCount > 9) { asnwerCount = 9; }
    for (let i = 0; i < asnwerCount; i++)
        await opros.react(`${i + 1}\u20e3`);
}

module.exports.help = {
    name: ["опрос"]
}