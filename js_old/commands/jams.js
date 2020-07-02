const Discord = require("discord.js");
const utils = require("../extra_modules/utils.js");
const jams = require("../json/jams.json");

module.exports.only_bot_channel = true;

module.exports.run = async (bot, message, cmd, args) =>
{
    let builder = new Discord.RichEmbed();

    if (!args[0])
    {
        let jams_list = "";
        let i = 1;
        jams.info.forEach(e => { jams_list += `${i++}. ${e.name}\n`; });

        builder
            .setTitle("Архив джемов Russian Gamedev")
            .setDescription("Вы можете узнать результаты прошедших джемов нашего сервера, а также поиграть в игры с этих джемов!\n\nДля того, чтобы посмотреть информацию по джему воспользуйтесь командой `!джем ID`\nГде ID = Номер джема в списке")
            .addField("Список Джемов", jams_list)
            .setColor("#FFFFFF");

        return utils.SendMessage(bot, message.channel, builder);
    }

    let index = Math.abs(parseInt(args[0].trim())) - 1;
    if (isNaN(index) || index < 0)
        return utils.SendMessage(bot, message.channel, "Ошибка, не распознан номер");

    if (index >= jams.info.length)
        return utils.SendMessage(bot, message.channel, "Такого номера нет в списке");


    let project_field = "";
    let author_field = "";
    let i = 1;
    jams.info[index].projects.forEach(e =>
    {
        if (e.win)
        {
            if (e.link)
                project_field += `**${i++}.** [**${e.name}**](${e.link})\n`;
            else
                project_field += `**${i++}. ${e.name}**\n`;
        }
        else
        {
            if (e.link)
                project_field += `${i++}. [${e.name}](${e.link})\n`;
            else
                project_field += `${i++}. ${e.name}\n`;
        }

        author_field += `${e.author}\n`;
    });

    let links = "";
    if (jams.info[index].link)
        links += `Ссылка на игры: ${jams.info[index].link}\n`;

    if (jams.info[index].streamlink)
        links += `Ссылка на стрим: ${jams.info[index].streamlink}`;

    project_field = project_field.substr(0, 1023);
    author_field = author_field.substr(0, 1023);

    builder.setTitle(jams.info[index].name)
        .setDescription(`**Тема**: ${jams.info[index].theme}\n**Призы**: ${jams.info[index].prize}\n**Дата проведения**: ${jams.info[index].time}`)
        .addField("Проект и место", project_field, true)
        .addField("Автор(ы)", author_field, true)
        .addField("Ссылки", links)
        .setColor("#FFFFFF");

    utils.SendMessage(bot, message.channel, builder);
}

module.exports.help = {
    name: ["джем", "джемы"]
}