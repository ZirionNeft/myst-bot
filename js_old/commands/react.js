const Discord = require("discord.js");
const utils = require("../extra_modules/utils.js");

module.exports.only_bot_channel = false;

module.exports.run = async (bot, message, cmd, args) =>
{
    if (utils.IsAdmin(bot.rgdGuild.member(message.author)))
    {
        if (!args[0] || !args[1]) return;
        message.delete()
            .catch(ex => utils.HandleException(bot, ex));

        let msg = await message.channel.fetchMessage(args[0])
            .catch(ex => utils.HandleException(bot, ex));

        if (msg)
            msg.react(args[1])
                .catch(ex => utils.HandleException(bot, ex));
    }
}

module.exports.help = {
    name: ["реакт", "htfrn", "react"]
}