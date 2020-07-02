const Discord = require("discord.js");
const utils = require("../extra_modules/utils.js");

module.exports.only_bot_channel = true;

module.exports.run = async (bot, message, cmd, args) =>
{
    if (bot.playingUsers.includes(message.author.id)) return;

    let amount = Math.abs(parseInt(args[0]));
    if (!amount) amount = 0;

    if (amount > utils.GetCoins(message.author))
        return message.channel.send(`Извините, <@${message.author.id}>, но у вас недостаточно монет`);

    CoinflipGame(bot, message, message.guild.member(message.author), amount);
}

async function CoinflipGame(bot, message, player, bet)
{
    bot.playingUsers.push(message.author.id);
    
    let win = Math.random() <= 0.49;
    let currentBalance = utils.GetCoins(player);
    let newBalance = currentBalance;

    if (bet > 0)
    {
        if (win)
        {
            utils.AddCoins(player, bet);
            newBalance += bet;
        }
        else 
        {
            utils.AddCoins(player, -bet);
            newBalance -= bet;
        }
        utils.SaveCoins();
    }

    let embed = new Discord.RichEmbed()
        .setAuthor(`${player.displayName} подбросил монетку`, player.user.avatarURL)
        .setDescription(`**ПОДБРАСЫВАЕМ...**\n__Ставка:__ **${bet}** <:rgd_coin_rgd:518875768814829568>\n__Баланс:__ **${(bet == 0) ? currentBalance : "?"}** <:rgd_coin_rgd:518875768814829568>`)
        .setThumbnail("https://cdn.discordapp.com/emojis/518875396545052682.gif?v=1")
        .setColor("#FFFFFF");

    let mess = await utils.SendMessage(bot, message.channel, embed);

    embed.setDescription(
        win ?
            `**ПОБЕДА!**\n__Ставка:__ **${bet}** <:rgd_coin_rgd:518875768814829568>\n__Баланс:__ **${newBalance}** <:rgd_coin_rgd:518875768814829568>` :
            `**ПРОИГРЫШ**\n__Ставка:__ **${bet}** <:rgd_coin_rgd:518875768814829568>\n__Баланс:__ **${newBalance}** <:rgd_coin_rgd:518875768814829568>`
    ).setThumbnail(win ? "https://cdn.discordapp.com/emojis/518875768814829568.png?v=1" : "https://cdn.discordapp.com/emojis/518875812913610754.png?v=1");

    setTimeout(() =>
    {
        mess.edit(embed);
        bot.playingUsers.splice(bot.playingUsers.indexOf(message.author.id), 1);
    }, 3000);
}

module.exports.help = {
    name: ["флип", "монетка"]
}