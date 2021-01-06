import { Message, MessageEmbed } from "discord.js";
import { Inject } from "typescript-ioc";
import { config } from "node-config-ts";
import { ApplyOptions } from "@sapphire/decorators";
import { Args, BucketType, UserError } from "@sapphire/framework";
import { MystCommandOptions } from "mystbot";
import LoggerFactory from "../../lib/utils/LoggerFactory";
import UserService from "../../lib/services/UserService";
import { MystCommand } from "../../lib/structures/MystCommand";

const COINS_EMOJI = config.bot.currencyEmoji;

@ApplyOptions<MystCommandOptions>({
  name: "coins",
  aliases: ["money", "cash"],
  description:
    "Shows your coins. Use the user mention to get guild member coins",
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
  usages: "coins [@member | top | give]",
  category: "Economy",
  subCommands: [
    {
      name: "give",
      command: "coins-give",
    },
    {
      name: "top",
      command: "coins-top",
    },
  ],
})
export default class CoinsCommand extends MystCommand {
  @Inject
  private userService!: UserService;

  public async run(message: Message, args: Args) {
    const target = await args.pickResult("member");
    if (!target.success)
      throw new UserError(
        "CoinsArgumentError",
        "You must specify a member, and it did not match."
      );

    const messageEmbed = new MessageEmbed();
    const author = message.author;
    const contextGuildId = message.guild?.id ?? "";

    const guildMember = target.value;

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

      return await message.channel.send({ embed: messageEmbed });
    } catch (e) {
      LoggerFactory.get(CoinsCommand).error(e);
    }
  }
}
