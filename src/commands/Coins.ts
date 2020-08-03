import {
  Command,
  CommandMessage,
  Description,
  Infos,
  Rule,
} from "@typeit/discord";
import { MessageEmbed, NewsChannel, TextChannel, User } from "discord.js";
import { ThunderBot } from "../ThunderBot";
import Economy from "../database/models/economy";
import { FieldsEmbed } from "discord-paginationembed";
import { Database } from "../database/Database";
import EconomyService from "../services/EconomyService";
import { Inject } from "typescript-ioc";
import * as console from "console";

const COINS_TOP =
  "https://cdn4.iconfinder.com/data/icons/popular-3/512/best-512.png";
const COINS_EMOJI = () =>
  ThunderBot.config.icons.find((e) => e.name === "coins")?.value;

export abstract class Coins {
  @Inject
  private economyService!: EconomyService;

  protected subCommands = ["top", "give"];

  @Command("coins :member")
  @Infos<CommandInfo>({
    description:
      "Shows your coins. Use the user mention to get guild member coins",
    usages: "coins [@member | top | give]",
    category: "Economy",
    coreCommand: true,
  })
  async runCoins(command: CommandMessage) {
    const { member }: { member: string } = command.args;

    // for prevent multi commands proc
    if (this.subCommands.includes(member)) return;

    const messageEmbed = new MessageEmbed();
    const author = command.author;

    const guildMember = command.mentions.members?.first() ?? command.member;

    const userId = guildMember?.user.id ?? author.id;
    const memberModelInstance = await this.economyService.findOneOrCreate(
      userId
    );

    messageEmbed
      .setAuthor(
        `Монеты ${guildMember?.displayName ?? author.username}`,
        guildMember?.user.avatarURL() || author?.avatarURL() || undefined
      )
      .setDescription(
        `__Coins:__ ${memberModelInstance.coins} ${COINS_EMOJI()}`
      )
      .setColor("#FFFFFF");

    return await command.channel.send({ embed: messageEmbed });
  }

  @Command(Rule("coins").space("top").end())
  @Infos<CommandInfo>({
    description: "Top members filtered by amount of coins",
    usages: "coins top",
    category: "Economy",
  })
  async coinsTop(command: CommandMessage) {
    const memberModels = await this.economyService.getAllPositiveCoins();

    const coinsTopEmbed = new FieldsEmbed<Economy>();

    coinsTopEmbed.embed
      .setAuthor("Coins leaderboard", COINS_TOP)
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

  // @Command("coins award :member")
  // async adminAddCoins(command: CommandMessage) {}

  @Command("coins give :mention :coins")
  @Infos<CommandInfo>({
    description: "Allows you to give some coins to mentioned member",
    usages: "coins give <@member> <amount>",
    category: "Economy",
  })
  async giveCoins(command: CommandMessage) {
    const { coins }: { coins: string } = command.args;
    const target = command.guild?.member(command.mentions.users.first() ?? "");
    const amount = parseInt(coins);

    const targetModelInstance = await this.economyService.findOne(
      target?.id ?? ""
    );

    if (!target || !targetModelInstance)
      return command.channel.send(
        `__${command.author.username}__, target user not found!`
      );

    if (!amount || amount <= 0)
      return command.channel.send(
        `__${command.author.username}__, amount of icons specified not properly`
      );

    const authorModelInstance = await this.economyService.findOne(
      command.author.id
    );

    if (!authorModelInstance || authorModelInstance.coins < amount)
      return command.channel.send(
        `__${command.author.username}__, you are not rich enough to give so many coins`
      );

    if (command.author.id === target?.id)
      return command.channel.send(
        `__${command.author.username}__, transferring coins to yourself will not work. It would be so simple...`
      );

    try {
      await Database.instance.transaction(async (t) =>
        Promise.all([
          this.economyService.update(
            authorModelInstance,
            { coins: authorModelInstance.coins - amount },
            t
          ),
          this.economyService.update(
            targetModelInstance,
            { coins: targetModelInstance.coins + amount },
            t
          ),
        ])
      );
    } catch (e) {
      console.error(e);
      return command.channel.send(
        `__${command.author.username}__, an error occurred while transferring coins. Contact the bot support`
      );
    }

    return command.channel
      .send(
        `__${command.author.username}__ sends to __${
          target.user.username
        }__ ${amount} ${COINS_EMOJI()}`
      )
      .catch((r) => {
        (command.guild?.channels.cache.get(
          ThunderBot.config.channels.find((v) => v.name === "private")?.value ??
            ""
        ) as TextChannel).send(`${r.name}\n${r.message}`);
      });
  }
}
