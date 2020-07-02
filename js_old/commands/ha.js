const Discord = require("discord.js");
const utils = require("../extra_modules/utils.js");
const fs = require('fs');

module.exports.only_bot_channel = false;

module.exports.run = async (bot, message, cmd, args) =>
{
message.delete();
    let buffer = fs.readFileSync('./ha.mp3');
    let attachment = new Discord.Attachment(buffer, 'fuit-ha.mp3');
    message.channel.send(attachment);
}

module.exports.help = {
    name: ["ха"]
}