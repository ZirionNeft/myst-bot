import { ApplyOptions } from "@sapphire/decorators";
import { Args, Command, UserError } from "@sapphire/framework";
import { Message } from "discord.js";
import { MystCommandOptions } from "mystbot";
import { MessageHelpers } from "../../utils/MessageHelpers";
import UserService from "../../services/UserService";
import { Inject } from "typescript-ioc";
import { config } from "node-config-ts";
import LoggerFactory from "../../utils/LoggerFactory";
import App from "../../App";

const COINS_EMOJI = config.bot.currencyEmoji;

@ApplyOptions<MystCommandOptions>({
  aliases: ["send", "gift"],
  description: "Allows you to give some coins to mentioned member",
  preconditions: ["GuildOnly", "Cooldown"],
  usages: "coins give <@member> <amount>",
  category: "Economy",
})
export default class CoinsGiveCommand extends Command {
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
      LoggerFactory.get(CoinsGiveCommand).error(e);
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
      LoggerFactory.get(CoinsGiveCommand).error(e);
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
