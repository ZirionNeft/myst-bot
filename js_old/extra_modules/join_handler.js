const utils = require("./utils.js");
const savedRoles = require("../json/saved_roles.json");

module.exports.Handle = async (bot, guildMember) =>
{
    if (guildMember.guild != bot.rgdGuild) return;

    if (savedRoles[guildMember.id])
    {
        guildMember.addRoles(savedRoles[guildMember.id]);
        let mes = await utils.SendMessage(bot, bot.cachedChannels.bot, `wait for it...`);
        let r = "";
        savedRoles[guildMember.id].forEach(role =>
        {
            r += `<@&${role}>\n`;
        });
        mes.edit(`<@${guildMember.id}>, добро пожаловать обратно, вам возвращены следующие роли:\n${r}`);
    }
}