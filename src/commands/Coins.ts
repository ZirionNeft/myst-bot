import { Command, CommandMessage, Rule } from "@typeit/discord";
import { MessageEmbed, NewsChannel, TextChannel, User } from "discord.js";
import BaseCommand from "./BaseCommand";
import { ThunderBot } from "../ThunderBot";
import Economy from "../database/models/economy";
import { Transaction } from "sequelize";
import { FieldsEmbed } from "discord-paginationembed";
import { Database } from "../database/Database";
import EconomyService from "../services/EconomyService";
import { Inject } from "typescript-ioc";

export abstract class Coins extends BaseCommand {
  // TODO: to remove. add infos decorator for every command decorator
  protected _onlyBotChannel = false;

  @Inject
  private economyService!: EconomyService;

  private subCommands = ["top", "give"];

  @Command("coins :member")
  async runCoins(command: CommandMessage) {
    const { member }: { member: string } = command.args;

    if (this.subCommands.includes(member)) return;

    const messageEmbed = new MessageEmbed();
    const author = command.author;

    const icon = ThunderBot.config.icons.find((e) => e.name === "coins")?.value;

    const guildMember =
      typeof member === "undefined"
        ? command.member
        : command.guild?.members.cache.get(member.slice(3, member.length - 1));

    const userId = guildMember?.user.id ?? author.id;
    const memberModelInstance = await this.economyService.getUser(userId);

    if (memberModelInstance) {
      messageEmbed
        .setAuthor(
          `Монеты ${guildMember?.displayName ?? author.username}`,
          guildMember?.user.avatarURL() || author?.avatarURL() || undefined
        )
        .setDescription(`__Coins:__ ${memberModelInstance.coins} ${icon}`)
        .setColor("#FFFFFF");

      return await command.channel.send({ embed: messageEmbed });
    } else {
      return await command.channel.send("Юзер не найден");
    }
  }

  @Command(Rule("coins").space("top").end())
  async coinsTop(command: CommandMessage) {
    const memberModels = await this.economyService.getAllPositiveCoins();

    const coinsTopEmbed = new FieldsEmbed<Economy>();

    coinsTopEmbed.embed
      .setAuthor(
        "Coins leaderboard",
        "https://cdn.discordapp.com/emojis/518875768814829568.png?v=1"
      )
      .setColor("#FFFFFF");

    return await coinsTopEmbed
      .setAuthorizedUsers([command.author.id])
      .setChannel(
        command.channel as Exclude<typeof command.channel, NewsChannel>
      )
      .setClientAssets({ prompt: "Yo, {{user}}, describe the page!" })
      .setArray(memberModels)
      .setElementsPerPage(10)
      .setPageIndicator(false)
      .formatField(
        "#",
        (el) => 1 + memberModels.findIndex((v) => el.id === v.id)
      )
      .formatField("User", (el) => `<@${el.memberSnowflake}>`)
      .formatField("Coins", (el) => el.coins)
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

  @Command("coins award :member")
  async adminAddCoins(command: CommandMessage) {}

  @Command("coins give :arg1 :arg2")
  async giveCoins(command: CommandMessage) {
    const { arg1, arg2 }: { arg1: string; arg2: string } = command.args;
    const target = command.guild?.member(command.mentions.users.first() ?? "");
    const amount = parseInt(arg2);

    const targetModelInstance = await this.economyService.getUser(
      target?.id ?? ""
    );

    if (!target || !targetModelInstance)
      return command.channel.send(
        `<@${command.author.id}>, target user not found!`
      );

    if (!amount || amount <= 0)
      return command.channel.send(
        `<@${command.author.id}>, amount of icons specified not properly`
      );

    const authorModelInstance = await this.economyService.getUser(
      command.author.id
    );

    if (!authorModelInstance || authorModelInstance.coins < amount)
      return command.channel.send(
        `<@${command.author.id}>, you are not rich enough to give so many coins`
      );

    if (command.author.id === target?.id)
      return command.channel.send(
        `<@${command.author.id}>, transferring coins to yourself will not work. It would be so simple...`
      );

    try {
      await Database.instance.transaction(async (t) =>
        Promise.all([
          this.change(command.author, -amount, authorModelInstance, t),
          this.change(target.user, amount, targetModelInstance, t),
        ])
      );
    } catch (e) {
      console.error(e);
      return command.channel.send(
        `<@${command.author.id}>, an error occurred while transferring coins. Contact the administration`
      );
    }

    return command.channel
      .send(
        `<@${command.author.id}> sends to <@${target.id}> ${amount} <:rgd_coin_rgd:518875768814829568>`
      )
      .catch((r) => {
        (command.guild?.channels.cache.get(
          ThunderBot.config.channels.find((v) => v.name === "private")?.value ??
            ""
        ) as TextChannel).send(`${r.name}\n${r.message}`);
      });
  }

  private async change(
    user: User,
    amount: number,
    model?: Economy | null,
    transaction?: Transaction
  ) {
    if (!model) {
      model = await this.economyService.getUser(user.id);
    }

    if (!model) throw new Error("User not found in database");

    return await model.update(
      {
        coins: model.coins + amount,
      },
      { transaction }
    );
  }
}
