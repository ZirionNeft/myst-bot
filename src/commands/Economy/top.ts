import { ApplyOptions } from "@sapphire/decorators";
import { Args, Command } from "@sapphire/framework";
import { Message } from "discord.js";
import { MystCommandOptions } from "mystbot";
import { Guild } from "discord.js";
import { MessageHelpers } from "../../utils/MessageHelpers";
import UserService from "../../services/UserService";
import { Inject } from "typescript-ioc";
import { FieldsEmbed } from "discord-paginationembed/typings";
import { UserModel } from "../../database/models";
import { config } from "node-config-ts";
import { NewsChannel } from "discord.js";
import LoggerFactory from "../../utils/LoggerFactory";

const COINS_TOP = config.bot.commands.coins.topIcon;

@ApplyOptions<MystCommandOptions>({
  aliases: ["board", "leaderboard", "list"],
  description: "Members top filtered by amount of coins",
  preconditions: ["GuildOnly", "Cooldown"],
  usages: "coins top",
  category: "Economy",
})
export default class CoinsTopCommand extends Command {
  @Inject
  private userService!: UserService;

  public async run(message: Message, args: Args) {
    const guild = message.guild as Guild;
    try {
      const memberModels = await this.userService.getAllPositiveCoins(guild.id);

      if (!memberModels.length) {
        return await MessageHelpers.sendPublicNote(
          message,
          "There is no at least one member who has more than 0 coins..."
        );
      }

      const coinsTopEmbed = new FieldsEmbed<UserModel>();

      if (message instanceof NewsChannel) {
        return await MessageHelpers.sendPublicNote(
          message,
          "Not in News Channel"
        );
      }

      coinsTopEmbed.embed
        .setAuthor("Coins leaderboard", COINS_TOP)
        .setColor("#FFFFFF");

      return await coinsTopEmbed
        .setAuthorizedUsers([message.author.id])
        .setChannel(
          message.channel as Exclude<typeof message.channel, NewsChannel>
        )
        .setClientAssets({ prompt: "{{user}}, pick a number of page!" })
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
      LoggerFactory.get(CoinsTopCommand).error(e.message);
    }
  }
}
