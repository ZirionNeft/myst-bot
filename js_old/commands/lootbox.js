const Discord = require("discord.js");
const utils = require("../extra_modules/utils.js");
module.exports.only_bot_channel = true;

module.exports.run = async (bot, message, args) =>
{
    let user = message.author;
    let date = utils.GetLootboxDate(user);

    if (date <= Date.now())
    {
        let winning = Math.floor(Math.random() * 16) + 5;
        let data = new Date(Date.now());
        data.setHours(data.getHours() + 12);

        utils.AddCoins(user, winning);
        utils.SetLootboxDate(user, data);
        utils.SaveCoins();

        message.channel.send(`<@${message.author.id}> получил из подарка ${winning} монет`);
    } 
    else
    {
        let hours = new Date(date - Date.now());
        message.channel.send(`Извините, <@${message.author.id}>, ваш подарок еще не доступен, попробуйте через ${Math.floor(hours / 1000 / 60 / 60)} часов ${Math.floor((hours / 1000 / 60 / 60) % 1 * 60)} минут`);
    }
}

module.exports.help = {
    name: ["лутбокс", "подарок"]
}