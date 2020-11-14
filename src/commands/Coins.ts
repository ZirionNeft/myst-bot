import { Command, CommandMessage, Guard, Infos, Rule } from "@typeit/discord";
import { MessageEmbed, NewsChannel, TextChannel, User } from "discord.js";
import UserModel from "../database/models/User.model";
import { FieldsEmbed } from "discord-paginationembed";
import UserService from "../services/UserService";
import { Inject } from "typescript-ioc";
import {
  InGuildOnly,
  NotBot,
  NotBotMentionInArgs,
  ThrottleMessage,
  WithoutSubCommands,
} from "../guards";
import { MessageHelpers } from "../utils/MessageHelpers";
import { StringHelpers } from "../utils/StringHelpers";
import LoggerFactory from "../utils/LoggerFactory";
import { MystBot } from "../MystBot";

const COINS_TOP =
  "https://cdn4.iconfinder.com/data/icons/popular-3/512/best-512.png";
const COINS_EMOJI = "<:coin:742364602662125648>";
const SUB_COMMANDS = ["top", "give"];

export class Coins {
  @Inject
  private userService!: UserService;

  @Command("coins :member")
  @Infos<CommandInfo>({
    description:
      "Shows your coins. Use the user mention to get guild member coins",
    usages: "coins [@member | top | give]",
    category: "Economy",
    coreCommand: true,
  })
  @Guard(
    NotBot(),
    InGuildOnly(),
    WithoutSubCommands(SUB_COMMANDS),
    ThrottleMessage(),
    NotBotMentionInArgs()
  )
  async runCoins(command: CommandMessage) {
    const { member }: { member: string } = command.args;

    const messageEmbed = new MessageEmbed();
    const author = command.author;
    const contextGuildId = command.guild?.id ?? "";

    const id = StringHelpers.getSnowflakeFromMention(member);
    const guildMember =
      command.guild?.members.cache.find((m) => m.id === id) ?? command.member;

    const userId = guildMember?.user.id ?? author.id;
    try {
      const memberModelInstance = await this.userService.findOneOrCreate(
        userId,
        contextGuildId
      );

      messageEmbed
        .setAuthor(
          `${guildMember?.displayName ?? author.username}'s currency info`,
          guildMember?.user.avatarURL() || author?.avatarURL() || undefined
        )
        .setDescription(
          `__Coins:__ ${memberModelInstance.coins} ${COINS_EMOJI}`
        )
        .setColor("YELLOW");

      return await command.channel.send({ embed: messageEmbed });
    } catch (e) {
      LoggerFactory.get(Coins).error(e);
    }
  }

  @Command(Rule("coins").space("top").end())
  @Infos<CommandInfo>({
    description: "Top members filtered by amount of coins",
    usages: "coins top",
    category: "Economy",
  })
  @Guard(NotBot(), InGuildOnly(), ThrottleMessage())
  async coinsTop(command: CommandMessage) {
    if (!command.guild?.id) return;

    try {
      const memberModels = await this.userService.getAllPositiveCoins(
        command.guild.id
      );

      if (!memberModels.length) {
        return await MessageHelpers.sendPublicNote(
          command,
          "There is no at least one member who has more than 0 coins..."
        );
      }

      const coinsTopEmbed = new FieldsEmbed<UserModel>();

      coinsTopEmbed.embed
        .setAuthor("Coins leaderboard", COINS_TOP)
        .setColor("#FFFFFF");

      return await coinsTopEmbed
        .setAuthorizedUsers([command.author.id])
        .setChannel(
          command.channel as Exclude<typeof command.channel, NewsChannel>
        )
        .setClientAssets({ prompt: "Hey, {{user}}, pick a number of page!" })
        .setArray(memberModels)
        .setElementsPerPage(10)
        .setPageIndicator(false)
        .formatField(
          "#",
          (el) => 1 + memberModels.findIndex((v) => el.id === v.id)
        )
        .formatField("User", (el) => `<@${el.userId}>`)
        .formatField("Coins", (el) => el.coins)
        .setPage(1)
        .setTimeout(60000)
        .setNavigationEmojis({
          back: "◀",
          jump: "↗",
          forward: "▶",
          delete: "🗑",
        })
        .build();
    } catch (e) {
      LoggerFactory.get(Coins).error(e.message);
    }
  }

  @Command("coins give :member :coins")
  @Infos<CommandInfo>({
    description: "Allows you to give some coins to mentioned member",
    usages: "coins give <@member> <amount>",
    category: "Economy",
  })
  @Guard(NotBot(), InGuildOnly(), ThrottleMessage(), NotBotMentionInArgs())
  async giveCoins(command: CommandMessage) {
    const { member, coins }: { member: string; coins: string } = command.args;
    const targetId = StringHelpers.getSnowflakeFromMention(member);
    const target = command.guild?.members.cache.find((m) => m.id === targetId);
    const amount = parseInt(coins);
    const contextGuildId = command.member?.guild?.id;

    if (!target || !targetId)
      return MessageHelpers.sendPublicNote(command, "target user not found!");

    let targetModelInstance;
    try {
      if (!contextGuildId) throw new Error("Guild id cannot be null");
      targetModelInstance = await this.userService.findOneOrCreate(
        targetId,
        contextGuildId
      );
    } catch (e) {
      LoggerFactory.get(Coins).error(e);
      return (
        command.member &&
        (await MessageHelpers.sendSystemErrorDM(command.member, [
          {
            name: "Command",
            value: `${command.commandName} ${command.commandContent}`,
          },
        ]))
      );
    }

    if (!amount || amount <= 0)
      return MessageHelpers.sendPublicNote(
        command,
        "amount of coins specified not properly"
      );

    const authorModelInstance = await this.userService.findOne(
      command.author.id,
      contextGuildId
    );

    if (!authorModelInstance || authorModelInstance.coins < amount)
      return MessageHelpers.sendPublicNote(
        command,
        "you are not rich enough to give so many coins"
      );

    if (command.author.id === targetId)
      return MessageHelpers.sendPublicNote(
        command,
        "you cannot give coins to yourself!"
      );

    try {
      await MystBot.database.sequelize.transaction(async (t) =>
        Promise.all([
          this.userService.update(
            authorModelInstance.userId,
            contextGuildId,
            { coins: authorModelInstance.coins - amount },
            t
          ),
          this.userService.update(
            targetModelInstance.userId,
            contextGuildId,
            { coins: targetModelInstance.coins + amount },
            t
          ),
        ])
      );
    } catch (e) {
      LoggerFactory.get(Coins).error(e);
      return (
        command.member &&
        (await MessageHelpers.sendSystemErrorDM(command.member, [
          {
            name: "Command",
            value: `${command.commandName} ${command.commandContent}`,
          },
        ]))
      );
    }

    return command.channel.send(
      `**${command.author.username}** sends to **${target.user.username}** ${amount} Coins ${COINS_EMOJI}`
    );
  }
}
