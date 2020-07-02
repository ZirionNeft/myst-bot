const Discord = require("discord.js");
const utils = require("../extra_modules/utils.js");

module.exports.only_bot_channel = false;

module.exports.run = async (bot, message, cmd, args) =>
{
    let target = (
        bot.rgdGuild.member(message.mentions.users.first()) ||
        bot.rgdGuild.members.get(args[0]) ||
        bot.rgdGuild.members.get(args[1])
    );

    if (target)
    {
        if (args[0] == "создан")
            return utils.SendMessage(bot, message.channel, `**${target.displayName}** создал аккаунт ${target.user.createdAt.toUTCString()}`);

        return utils.SendMessage(bot, message.channel, `**${target.displayName}** зашел на сервер ${target.joinedAt.toUTCString()}`);
    }

    return utils.SendMessage(bot, message.channel, `Сервер был создан ${message.guild.createdAt.toUTCString()}`);
}

module.exports.help = {
    name: ["когда", "когдазашел"]
}