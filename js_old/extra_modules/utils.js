const Discord = require("discord.js");
const coins = require("../json/coins.json");
const fs = require("fs");
const savedRoles = require("../json/saved_roles.json");

module.exports.IsAdmin = (guildMember) =>
{
    return guildMember.hasPermission(Discord.Permissions.FLAGS.ADMINISTRATOR);
}

module.exports.IsJeka = (bot, guildMember) =>
{
    return guildMember.id == bot.rgdGuild.ownerID;
}

module.exports.SaveRoles = (guildMember) =>
{
    let roles = [];
    guildMember.roles.forEach(role => 
    {
        if (!(/everyone/gi.test(role.name)) && !role.hasPermission("KICK_MEMBERS"))
            roles.push(role.id);
    });
    savedRoles[guildMember.id] = roles;

    fs.writeFile("./json/saved_roles.json", JSON.stringify(savedRoles), (err) =>
    {
        if (err)
            console.log(err);
    })
}

module.exports.CheckForCoinsRegistered = (user) =>
{
    if (!coins[user.id])
    {
        coins[user.id] = {
            coins: 0,
            lootboxDate: new Date(Date.now()),
            rouletteDate: new Date(Date.now())
        };
    }
}

module.exports.GetLootboxDate = (user) =>
{
    this.CheckForCoinsRegistered(user);
    if (!coins[user.id].lootboxDate)
    {
        coins[user.id].lootboxDate = new Date(Date.now());
        this.SaveCoins();
    }
    return new Date(coins[user.id].lootboxDate).valueOf();
}

module.exports.GetRouletteDate = (user) =>
{
    this.CheckForCoinsRegistered(user);
    if (!coins[user.id].rouletteDate)
    {
        coins[user.id].rouletteDate = new Date(Date.now());
        this.SaveCoins();
    }
    return new Date(coins[user.id].rouletteDate).valueOf();
}

module.exports.SetRouletteDate = (user, date) =>
{
    this.CheckForCoinsRegistered(user);
    coins[user.id].rouletteDate = date;
}

module.exports.SetLootboxDate = (user, date) =>
{
    this.CheckForCoinsRegistered(user);
    coins[user.id].lootboxDate = date;
}

module.exports.GetCoins = (user) =>
{
    this.CheckForCoinsRegistered(user);
    return coins[user.id].coins;
}

module.exports.AddCoins = (user, amount) =>
{
    this.CheckForCoinsRegistered(user);
    coins[user.id].coins += amount;
    if (coins[user.id].coins < 0) coins[user.id].coins = 0;
}

module.exports.SaveCoins = () =>
{
    fs.writeFile("./json/coins.json", JSON.stringify(coins), (err) =>
    {
        if (err)
            console.log(err);
    })
}

module.exports.HandleException = async (bot, ex) =>
{
    this.SendMessage(bot, bot.cachedChannels.tsar, `${ex.name}\n${ex.message}`);
}

module.exports.SendMessage = async (bot, channel, text) => 
{
    return channel.send(text)
        .catch(ex =>
        {
            bot.cachedChannels.tsar.send(`${ex.name}\n${ex.message}`);
        });
}