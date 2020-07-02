const Discord = require("discord.js");
const utils = require("../extra_modules/utils.js");

module.exports.only_bot_channel = true;

module.exports.run = async (bot, message, cmd, args) =>
{
    let target = message.guild.member(message.author);
    let roles = target.roles.filter(r => { return /#[A-F0-9]{6}$/i.test(r.name); });
    roles = roles.sort((a, b) => { return b.position - a.position; });
    roles = roles.array();
    let cross_indexes = new Array(roles.length).fill(false);

    let desc = `В этом окне вы можете снять с себя любую кастомную роль\nЕсли вы хотели настроить общие роли - сделайте это на канале <#${bot.cachedChannels.roles.id}>\n\nНажмите на реакцию повторно, если удалили роль по ошибке.`;

    if (roles.length <= 0)
    {
        let rep = new Discord.RichEmbed()
        .setAuthor(`Роли ${target.displayName}`, target.user.avatarURL)
        .setDescription(desc)
        .addField("Список", "Похоже у вас ещё нет кастомных ролей")
        .setColor("#FFFFFF");

        return utils.SendMessage(bot, message.channel, rep);
    }
    
    let embed = GenerateEmbed(target, desc, roles, cross_indexes);

    let msg = await utils.SendMessage(bot, message.channel, embed);

    let filter = (reaction, user) => user.id == target.id && /\d\u20e3/i.test(reaction.emoji.name);
    let collector = msg.createReactionCollector(filter, { time: 35000 });
    collector.on('collect', async r => 
    {
        let chosen = parseInt(r.emoji.name.replace(/\u20e3/i, ""));
        if (!chosen)
        {
            utils.SendMessage(bot, bot.cachedChannels.tsar, `Chosen role by **${target.displayName}** was undefined but passed the filter. Check <#${bot.cachedChannels.bot.id}>\nName was: \`${r.emoji.name}\``);
            return;
        }
        r.remove(target);

        let role = roles[chosen - 1];
        if (target.roles.has(role.id))
        {
            cross_indexes[chosen - 1] = true;
            embed = GenerateEmbed(target, desc, roles, cross_indexes);
            msg.edit(embed);
            target.removeRole(role);
        }
        else
        {
            cross_indexes[chosen - 1] = false;
            embed = GenerateEmbed(target, desc, roles, cross_indexes);
            msg.edit(embed);
            target.addRole(role);
        }
    });
    collector.on('end', async collected => 
    {
        embed = GenerateEmbed(target, "Время работы данного окна вышло.\nПожалуйста, используйте команду `!роли` повторно", roles, cross_indexes);
        msg.edit(embed);
    });

    let length = roles.length;
    if (length > 9) length = 9;

    for (let i = 1; i <= length; i++)
        await msg.react(`${i}\u20e3`);
}

function GenerateRolesString(roles, cross_indexes)
{
    let ret = "";
    for (let i = 0; i < roles.length; i++)
    {
        ret += (i + 1) + ". ";
        if (cross_indexes[i])
            ret += "~~<@&" + roles[i].id + ">~~\n";
        else
            ret += "<@&" + roles[i].id + ">\n";
    }
    return ret;
}

function GenerateEmbed(target, desc, roles, cross_indexes)
{
    let embed = new Discord.RichEmbed()
        .setAuthor(`Роли ${target.displayName}`, target.user.avatarURL)
        .setDescription(desc)
        .addField("Список", GenerateRolesString(roles, cross_indexes))
        .setColor("#FFFFFF");

    return embed;
}

module.exports.help = {
    name: ["роль", "роли", "цвет"]
}