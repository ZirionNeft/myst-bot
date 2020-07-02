const utils = require("./utils.js");

module.exports.Handle = async (bot, message) =>
{
    if (message.author.bot) return;
    if (!message.content.startsWith("!")) return;

    let messageContent = message.content.replace(/  +/g, ' ');
    let messageArray = messageContent.split(" ");
    let cmd = messageArray[0].slice(1).trim().toLowerCase();
    let args = messageArray.slice(1);

    let commandfile = bot.commands.get(cmd);

    if (commandfile)
    {
        if (!(
            message.channel == bot.cachedChannels.bot ||
            utils.IsAdmin(message.member) ||
            !commandfile.only_bot_channel
        )) 
        {
            let reply = await utils.SendMessage(bot, message.channel, `Извините, <@${message.author.id}>, я не могу ответить тут. Попробуйте в <#${bot.cachedChannels.bot.id}>`);
            reply.delete(4000);
            return;
        }

        commandfile.run(bot, message, cmd, args);
    }
}