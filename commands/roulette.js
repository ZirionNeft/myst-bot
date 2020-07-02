const Discord = require("discord.js");
const coins = require("../json/coins.json");
const utils = require("../extra_modules/utils.js");
const shooter = require("../extra_modules/parts_module.js");
module.exports.only_bot_channel = true;

module.exports.run = async (bot, message, cmd, args) =>
{
    if (bot.playingUsers.includes(message.author.id)) return;

    let date = utils.GetRouletteDate(message.author);

    if (date <= Date.now())
    {
        bot.playingUsers.push(message.author.id);
        spin(bot, message, cmd, args);
    }
    else
    {
        let hours = new Date(date - Date.now());
        message.channel.send(`Извините, <@${message.author.id}>, вы ещё не отошли от травм, попробуйте через ${Math.floor(hours / 1000 / 60 / 60)} часов ${Math.floor((hours / 1000 / 60 / 60) % 1 * 60)} минут`);
    }
}

async function spin(bot, message, cmd, args)
{
    let win = !(Math.random() <= 0.18);
    let player = message.guild.member(message.author);

    let embed = new Discord.RichEmbed()
        .setAuthor(`${player.displayName} крутит рулетку`, player.user.avatarURL)
        .setDescription(`**ВЖУХ...**`)
        .setThumbnail("https://cdn.discordapp.com/attachments/506791803207548948/679100829009182812/666.gif")
        .setColor("#FFFFFF");

    let mess = await utils.SendMessage(bot, message.channel, embed);

    setTimeout(() =>
    {
        if (win)
        {
            let thumbs = [];
            thumbs.push("https://cdn.discordapp.com/attachments/506791803207548948/679101891539369992/win_1.png");
            thumbs.push("https://cdn.discordapp.com/attachments/506791803207548948/679101894441828352/win_2.png");
            thumbs.push("https://cdn.discordapp.com/attachments/506791803207548948/679101895213711370/win_3.png");
            thumbs.push("https://cdn.discordapp.com/attachments/506791803207548948/679102111014715412/wi_4.png");
            thumbs.push("https://cdn.discordapp.com/attachments/506791803207548948/679102112428195850/win_5.png");

            embed
            .setDescription(`**ВЫ ЖИВОЙ!**\n\nВы выиграли **5** <:rgd_coin_rgd:518875768814829568>\n\nВы можете попробовать крутануть ещё раз, если, всё-таки, хотите сдохнуть`)
            .setThumbnail(thumbs[Math.floor(Math.random() * thumbs.length)]);
            
            utils.AddCoins(player, 5);
            utils.SaveCoins();
        }
        else
        {
            embed
            .setDescription(`**Ой-Ой**\n\n${shooter.shoot(player.displayName)}\n\nВ связи с травмами вы не можете играть в рулетку 12 часов`)
            .setThumbnail("https://cdn.discordapp.com/attachments/506791803207548948/679100081022042141/suicide_00008.png");

            let data = new Date(Date.now());
            data.setHours(data.getHours() + 12);

            utils.SetRouletteDate(player, data);
            utils.SaveCoins();
        }

        bot.playingUsers.splice(bot.playingUsers.indexOf(message.author.id), 1);
        mess.edit(embed);
    }, 3000);
}

module.exports.help = {
    name: ["рулетка"]
}