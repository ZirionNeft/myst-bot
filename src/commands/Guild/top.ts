import { Message } from "discord.js";
import { Inject } from "typescript-ioc";
import { config } from "node-config-ts";
import { ApplyOptions } from "@sapphire/decorators";
import { Args, BucketType } from "@sapphire/framework";
import { MystCommandOptions } from "mystbot";
import { MystCommand } from "../../lib/structures/MystCommand";
import UserService from "../../services/UserService";
import { FieldsEmbed } from "discord-paginationembed/typings";
import { UserModel } from "../../database/models";
import { NewsChannel } from "discord.js";
import { calculateNextLevelXp } from "../../logic/GuildLevelingFactory";
import LoggerFactory from "../../utils/LoggerFactory";
import { MessageHelpers } from "../../utils/MessageHelpers";
import { TextChannel } from "discord.js";

const EXP_ICON = "https://icon-library.com/images/score-icon/score-icon-21.jpg";

@ApplyOptions<MystCommandOptions>({
  name: "top",
  aliases: ["leaderboard", "lb"],
  description: "Guild leaderboard by levels and experience",
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
  usages: "top",
  category: "Guild",
})
export default class TopCommand extends MystCommand {
  @Inject
  private _userService!: UserService;

  public async run(message: Message, args: Args) {
    if (!message.guild?.id) return;

    try {
      const memberModels = await this._userService.getUsersLeveling(
        message.guild.id
      );

      const coinsTopEmbed = new FieldsEmbed<UserModel>();

      coinsTopEmbed.embed
        .setAuthor("Experience leaderboard", EXP_ICON)
        .setColor("#FFFFFF");

      return await coinsTopEmbed
        .setAuthorizedUsers([message.author.id])
        .setChannel(
          message.channel as Exclude<typeof message.channel, NewsChannel>
        )
        .setClientAssets({ prompt: "{{user}}, pick a number of page!" })
        .setArray(memberModels)
        .setElementsPerPage(15)
        .setPageIndicator(false)
        .formatField("User", (el) => `<@${el.userId}>`)
        .formatField("Level", (el) => `\`${el.level}\``)
        .formatField(
          "Exp.",
          (el) => `\`${el.experience}/${calculateNextLevelXp(el.level)}\``
        )
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
      LoggerFactory.get(TopCommand).error(e.message);
      return await MessageHelpers.sendPublicError(
        message.channel as TextChannel,
        "I'm not enough permitted in this guild to perform that action :("
      );
    }
  }
}
