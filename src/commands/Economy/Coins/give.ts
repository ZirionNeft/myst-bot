import { Message } from "discord.js";
import { Inject } from "typescript-ioc";
import { config } from "node-config-ts";
import { ApplyOptions } from "@sapphire/decorators";
import { Args, BucketType, Command, UserError } from "@sapphire/framework";
import { MystCommandOptions } from "mystbot";
import LoggerFactory from "../../../utils/LoggerFactory";
import UserService from "../../../services/UserService";
import App from "../../../App";
import { MessageHelpers } from "../../../utils/MessageHelpers";
import { MystCommand } from "../../../lib/structures/MystCommand";

const COINS_EMOJI = config.bot.currencyEmoji;

@ApplyOptions<MystCommandOptions>({
  name: "give",
  aliases: ["send", "gift"],
  description: "Allows you to give some coins to mentioned member",
  usages: "coins give <@member> <amount>",
  preconditions: [
    "GuildOnly",
    {
      name: "Cooldown",
      context: {
        bucketType: BucketType.Guild,
        delay: config.bot.commandCoolDown,
      },
    },
  ],
  category: "Economy",
})
export default class CoinsGiveSubcommand extends MystCommand {
  @Inject
  private userService!: UserService;

  public async run(message: Message, args: Args) {
    const target = await args.pickResult("member");
    if (!target.success)
      throw new UserError(
        "CoinsGiveArgumentError",
        "You must specify a member and amount of coins, and the first one did not match."
      );

    const transferredCoins = await args.pickResult("integer");
    if (!transferredCoins.success)
      throw new UserError(
        "CoinsGiveArgumentError",
        "You must specify a member and amount of coins, and the second one did not match."
      );

    const amount = transferredCoins.value;
    const contextGuildId = message.member?.guild?.id;

    const errorData = [
      {
        name: "Command",
        value: `coins give ${App.Client.commands.find(
          (command) => command.name === "coins"
        )}`,
      },
    ];

    if (!target.value || !target.value.id)
      return MessageHelpers.sendPublicNote(message, "target user not found!");

    let targetModelInstance;
    try {
      if (!contextGuildId) throw new Error("Guild id can't be null");
      targetModelInstance = await this.userService.findOneOrCreate(
        target.value.id,
        contextGuildId
      );
    } catch (e) {
      LoggerFactory.get(CoinsGiveSubcommand).error(e);
      return (
        message.member &&
        (await MessageHelpers.sendSystemErrorDM(message.member, errorData))
      );
    }

    if (!amount || amount <= 0)
      return MessageHelpers.sendPublicNote(
        message,
        "amount of coins specified not properly"
      );

    const authorModelInstance = await this.userService.findOne(
      message.author.id,
      contextGuildId
    );

    if (!authorModelInstance || authorModelInstance.coins < amount)
      return MessageHelpers.sendPublicNote(
        message,
        "you are not rich enough to give so many coins"
      );

    if (message.author.id === target.value.id)
      return MessageHelpers.sendPublicNote(
        message,
        "you cannot give coins to yourself"
      );

    try {
      await App.Client.database.sequelize.transaction(async (t) =>
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
      LoggerFactory.get(CoinsGiveSubcommand).error(e);
      return (
        message.member &&
        (await MessageHelpers.sendSystemErrorDM(message.member, errorData))
      );
    }

    return message.channel.send(
      `**${message.author.username}** sends to **${target.value.user.username}** ${amount} Coins ${COINS_EMOJI}`
    );
  }
}
