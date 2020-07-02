const Discord = require("discord.js");
const coins = require("../json/coins.json");
const utils = require("../extra_modules/utils.js");

module.exports.only_bot_channel = false;

module.exports.run = async (bot, message, cmd, args) =>
{
    if (cmd == "баланс")
        return ShowBalance(bot, message, cmd, args);

    if (args[0] == "топ")
        return ShowTop(bot, message, cmd, args);

    if (args[0] == "дать" || args[0] == "отправить")
        return GiveCoins(bot, message, cmd, args);

    if (args[0] == "выдать" || args[0] == "отнять")
        return AdminAddCoins(bot, message, cmd, args);

    return ShowBalance(bot, message, cmd, args);
}

async function ShowBalance(bot, message, cmd, args)
{
    let target = (message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]));
    if (!target) target = message.guild.member(message.author);

    let embed = new Discord.RichEmbed()
        .setAuthor(`Монеты ${target.displayName}`, target.user.avatarURL)
        .setDescription(`__Баланс:__ ${utils.GetCoins(target)} <:rgd_coin_rgd:518875768814829568>`)
        .setColor("#FFFFFF");

    utils.SendMessage(bot, message.channel, embed);
}

async function AdminAddCoins(bot, message, cmd, args)
{
    if (utils.IsJeka(bot, message.author))
    {
        message.delete();
        let target = (message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[1]));
        let amount = Math.abs(parseInt(args[2]));

        if (!target || !amount)
            return;

        if (args[0] == "выдать")
        {
            utils.AddCoins(target, amount);
            utils.SendMessage(bot, message.channel, `**${message.guild.member(message.author).displayName}** выдал **${target.displayName}** ${args[2]} <:rgd_coin_rgd:518875768814829568>`);
            utils.SaveCoins();
            return;
        }

        if (args[0] == "отнять")
        {
            utils.AddCoins(target, -amount);
            utils.SendMessage(bot, message.channel, `**${message.guild.member(message.author).displayName}** отнял у **${target.displayName}** ${args[2]} <:rgd_coin_rgd:518875768814829568>`);
            utils.SaveCoins();
            return;
        }
    }
}

async function ShowTop(bot, message, cmd, args)
{
    let users = [];
    for (var key in coins)
    {
        if (coins[key].coins > 0)
            users.push({ coins: coins[key].coins, id: key })
    }

    users.sort((a, b) => a.coins - b.coins);

    let field1 = "";
    let field2 = "";

    let length = 10;
    if (args[1]) length = Math.abs(parseInt(args[1]));
    if (length == 0) length = 10;
    if (users.length < length) length = users.length;

    if (length <= 0)
        return utils.SendMessage(bot, message.channel, "Недостаточно пользователей с монетами для составления топа");

    for (var i = 0; i < length; i++)
    {
        let curusr = users.pop();
        field1 += `${i + 1}. <@${curusr.id}>\n`;
        field2 += `${curusr.coins}\n`;
    }

    let topCoins = new Discord.RichEmbed()
        .setAuthor("Топ по монетам", "https://cdn.discordapp.com/emojis/518875768814829568.png?v=1")
        .addField("Никнейм", field1, true)
        .addField("Монеты", field2, true)
        .setColor("#FFFFFF");

    return utils.SendMessage(bot, message.channel, topCoins);
}

async function GiveCoins(bot, message, cmd, args)
{
    let target = (message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[1]) || message.guild.members.get(args[2]));
    let amount = Math.abs(parseInt(args[1])) || Math.abs(parseInt(args[2]));

    if (!amount || amount == 0)
        return message.channel.send(`Извините, <@${message.author.id}>, введенное число не распознано`)

    if (utils.GetCoins(message.author) < amount)
        return message.channel.send(`Извините, <@${message.author.id}>, но у вас недостаточно монет`);

    if (message.author.id == target.id)
        return message.channel.send(`Извините, <@${message.author.id}>, вы не можете отправить монеты самому себе`);

    utils.AddCoins(message.author, -amount);
    utils.AddCoins(target, amount);
    utils.SaveCoins();

    utils.SendMessage(bot, message.channel, `<@${message.author.id}> отправил <@${target.id}> ${amount} <:rgd_coin_rgd:518875768814829568>`);
}

module.exports.help = {
    name: ["монеты", "лайки", "лайк", "монета", "баланс"]
}