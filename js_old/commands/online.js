const Discord = require("discord.js");
const utils = require("../extra_modules/utils.js");

module.exports.only_bot_channel = true;

module.exports.run = async (bot, message, cmd, args) =>
{
    let i = 0;
    let active = 0;
    let online_active = 0;
    message.guild.members.forEach(element =>
    {
        if (element.presence.status != "offline")
        {
            i++;
            if (element.roles.has(bot.cachedRoles.active.id))
            {
                active++;
                online_active++;
            }
        }
        else if (element.roles.has(bot.cachedRoles.active.id))
        {
            active++;
        }
    });

    let embed = new Discord.RichEmbed()
        .setTitle("Статистика Russian Gamedev")
        .addField("Всех", `Всего: ${message.guild.memberCount}\nОнлайн: ${i}`, true)
        .addField("Активных", `Всего: ${active}\nОнлайн: ${online_active}`, true)
        .setColor("#FFFFFF");

    utils.SendMessage(bot, message.channel, embed);
}

module.exports.help = {
    name: ["онлайн", "онлаин", "online", "актив", "активные", "активных"]
}