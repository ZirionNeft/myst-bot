const utils = require("./utils.js");

module.exports.Handle = async (bot, message_reaction, user, event) =>
{
    if (message_reaction.message.channel != bot.cachedChannels.roles) return;

    let index = /(\d)️⃣/.exec(message_reaction.emoji.name);
    if (index)
    {
        let chosen = parseInt(index[1]);
        if (!chosen) return;

        let regex = new RegExp(`${chosen}.?\\. <@&(\\d+)>`);

        return FindAndGive(bot, regex, message_reaction, user, event, true);
    }

    let letter = /\ud83c([\udde6-\uddff])/.exec(message_reaction.emoji.name);
    if (letter)
    {
        let chosen = letter[1];
        let alphabet = "abcdefghijklmnopqrstuvwxyz";
        alphabet = alphabet.charAt(chosen.charCodeAt(0) - 56806);

        let regex = new RegExp(`\\d${alphabet}\\. <@&(\\d+)>`);
        
        return FindAndGive(bot, regex, message_reaction, user, event, false);
    }
}

async function FindAndGive(bot, regex, message_reaction, user, event, wanted_original)
{
    let found = regex.exec(message_reaction.message.content);
    if (!found) return;
    let roleid = found[1];

    let role = bot.rgdGuild.roles.get(roleid);
    if (!role) return;
    let similar_role = bot.rgdGuild.roles.find(r => r.name == `${role.name}.`);
    if (!wanted_original && !similar_role) return;

    let target = bot.rgdGuild.member(user);

    if (wanted_original)
    {
        if (!target.roles.has(role.id) && event == "ADD")
            return target.addRole(role);

        if (target.roles.has(role.id) && event == "REMOVE")
            return target.removeRole(role);
        //Add here fix ro remove reaction from similar role and remove similar role
    }
    else
    {
        if (!target.roles.has(similar_role.id) && event == "ADD")
            return target.addRole(similar_role);

        if (target.roles.has(similar_role.id) && event == "REMOVE")
            return target.removeRole(similar_role);
        //Add here fix ro remove reaction from similar role and remove similar role
    }
}