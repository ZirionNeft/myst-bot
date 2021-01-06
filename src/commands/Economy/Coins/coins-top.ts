import { Guild, Message, NewsChannel } from "discord.js";
import { Inject } from "typescript-ioc";
import { config } from "node-config-ts";
import { ApplyOptions } from "@sapphire/decorators";
import { Args, CommandOptions } from "@sapphire/framework";
import LoggerFactory from "../../../lib/utils/LoggerFactory";
import UserService from "../../../lib/services/UserService";
import { MessageHelpers } from "../../../lib/utils/MessageHelpers";
import { MystCommand } from "../../../lib/structures/MystCommand";
import { UserModel } from "../../../lib/database/models";
import { FieldsEmbed } from "discord-paginationembed";

const COINS_TOP = config.bot.commands.coins.topIcon;

@ApplyOptions<CommandOptions>({
  name: "top",
  description: "Members top filtered by amount of coins",
  usages: "coins top",
  category: "Economy",
})
export default class CoinsTopSubcommand extends MystCommand {
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
      LoggerFactory.get(CoinsTopSubcommand).error(e.message);
    }
  }
}
