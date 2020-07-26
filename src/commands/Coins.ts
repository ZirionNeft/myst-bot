import { Command, CommandMessage, Rule, Rules } from "@typeit/discord";
import { MessageEmbed, NewsChannel } from "discord.js";
import BaseCommand from "./BaseCommand";
import { RgdBot } from "../RgdBot";
import Economy from "../database/models/economy";
import { Op } from "sequelize";
import { FieldsEmbed } from "discord-paginationembed";

export abstract class Coins extends BaseCommand {
  protected _onlyBotChannel = false;

  private subCommands = ["top", "топ"];

  @Command("coins :member")
  @Rules("баланс :member")
  async runCoins(command: CommandMessage) {
    const { member }: { member: string } = command.args;

    if (this.subCommands.includes(member)) return;

    const messageEmbed = new MessageEmbed();
    const author = command.author;

    const icon = RgdBot.config.icons.find((e) => e.name === "coins")?.value;

    const guildMember =
      typeof member === "undefined"
        ? command.member
        : command.guild?.members.cache.get(member.slice(3, member.length - 1));

    const userId = guildMember?.user.id ?? author.id;

    const memberModelInstance = await Economy.findOne({
      where: {
        memberSnowflake: userId,
      },
    });

    if (memberModelInstance) {
      messageEmbed
        .setAuthor(
          `Монеты ${guildMember?.displayName ?? author.username}`,
          guildMember?.user.avatarURL() || author?.avatarURL() || undefined
        )
        .setDescription(`__Баланс:__ ${memberModelInstance.coins} ${icon}`)
        .setColor("#FFFFFF");

      return await command.channel.send({ embed: messageEmbed });
    } else {
      return await command.channel.send("Юзер не найден");
    }
  }

  @Command(Rule("coins").space("top").end())
  @Rules(Rule("баланс").space("топ").end())
  async coinsTop(command: CommandMessage) {
    const memberModels = await Economy.findAll({
      where: {
        coins: {
          [Op.gt]: 0,
        },
      },
      order: [["coins", "DESC"]],
    });

    const coinsTopEmbed = new FieldsEmbed<Economy>();

    coinsTopEmbed.embed
      .setAuthor(
        "Топ по монетам",
        "https://cdn.discordapp.com/emojis/518875768814829568.png?v=1"
      )
      .setColor("#FFFFFF");

    return await coinsTopEmbed
      .setAuthorizedUsers([command.author.id])
      .setChannel(
        command.channel as Exclude<typeof command.channel, NewsChannel>
      )
      .setClientAssets({ prompt: "Yo {{user}} wat peige?!?!?" })
      .setArray(memberModels)
      .setElementsPerPage(10)
      .setPageIndicator(false)
      .formatField(
        "#",
        (el) => 1 + memberModels.findIndex((v) => el.id === v.id)
      )
      .formatField("Никнейм", (el) => `<@${el.memberSnowflake}>`)
      .formatField("Монеты", (el) => el.coins)
      .setPage(1)
      .setTimeout(69000)
      .setNavigationEmojis({
        back: "◀",
        jump: "↗",
        forward: "▶",
        delete: "🗑",
      })
      .build();
  }
}
