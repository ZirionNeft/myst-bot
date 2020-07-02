const Discord = require("discord.js");
const coins = require("../json/coins.json");
const utils = require("../extra_modules/utils.js");
const shop = require("../json/shop.json");

module.exports.only_bot_channel = true;

module.exports.run = async (bot, message, cmd, args) =>
{
    if (cmd == "магазин")
        return ShopInfo(bot, message, cmd, args);

    if (cmd == "тест")
        return ItemInfo(bot, message, cmd, args);
}

async function ShopInfo(bot, message, cmd, args)
{
    let items = "";
    let prices = "";
    let i = 1;
    shop.items.forEach(item => 
    {
        items += `${i++}. ${item.name}\n`;
        prices += `${item.price} <:rgd_coin_rgd:518875768814829568>\n`;
    });

    let embed = new Discord.RichEmbed()
        .setTitle("Магазин Russian Gamedev")
        .setDescription("Вы можете купить любой товар из списка в магазине за игровую валюту на сервере <:rgd_coin_rgd:518875768814829568>\n\nЧтобы узнать о товаре подробнее, напишите `!товар NUMBER`")
        .addField("Товары", items, true)
        .addField("Цена", prices, true)
        .setColor("#FFFFFF");

    return utils.SendMessage(bot, message.channel, embed);
}

async function Buy(bot, message, cmd, args)
{
    switch (args[0])
    {
        case "1":
            if (!db[message.author.id])
            {
                db[message.author.id] = {
                    coins: 0,
                    date: Date.now()
                };
                fs.writeFile("./databaseC.json", JSON.stringify(db), (err) =>
                {
                    if (err) console.log(err);
                })
            }

            if (100 > db[message.author.id].coins)
            {
                return message.channel.send(`Извините, <@${message.author.id}>, но у вас недостаточно монет`);
            } else
            {
                let hexcode = args[1].trim();

                let newrole = await message.guild.createRole({
                    name: hexcode.toUpperCase(),
                    color: hexcode,
                    position: message.guild.roles.array().length - 1
                });

                db[message.author.id].coins = db[message.author.id].coins - 100;
                fs.writeFile("./databaseC.json", JSON.stringify(db), (err) =>
                {
                    if (err) console.log(err);
                })

                message.member.addRole(newrole);

                message.channel.send(`<@${message.author.id}> изменил цвет ника в магазине на <@&${newrole.id}>`);
            }

            break;

        default: message.channel.send(`Извините, <@${message.author.id}>, но товара с таким номером не найдено`);
    }
}

async function ItemInfo(bot, message, cmd, args)
{
    let embed = new Discord.RichEmbed()
        .setTitle(shop.items[args[0]].name)
        .setDescription(shop.items[args[0]].description + shop.hint)
        .setColor("#FFFFFF");

    if (shop.items[args[0]].need_field)
    {
        switch(shop.items[args[0]].buy_action)
        {
            case "CLAIM_COLOR":
                embed.addField("Доступные цвета", "Тут короче типа цвета");
            break;
        }
    }

     utils.SendMessage(bot, message.channel, embed);
}

module.exports.help = {
    name: ["магазин"]
}