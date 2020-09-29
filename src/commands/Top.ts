import { Command, CommandMessage, Guard, Infos } from "@typeit/discord";
import { InGuildOnly, NotBot, ThrottleMessage } from "../guards";
import { MessageHelpers } from "../utils/MessageHelpers";
import LoggerFactory from "../utils/LoggerFactory";
import UserService from "../services/UserService";
import { Inject } from "typescript-ioc";
import { FieldsEmbed } from "discord-paginationembed";
import UserModel from "../database/models/User.model";
import { NewsChannel, TextChannel } from "discord.js";
import { NEXT_LEVEL_XP } from "../logic/GuildLevelingFactory";

const EXP_ICON = "https://icon-library.com/images/score-icon/score-icon-21.jpg";

export class Top {
  @Inject
  private _userService!: UserService;

  @Command("top")
  @Infos<CommandInfo>({
    description: "Guild members levels top",
    category: "Guild",
    coreCommand: true,
    usages: "top",
  })
  @Guard(NotBot(), InGuildOnly(), ThrottleMessage())
  async runTop(command: CommandMessage) {
    if (!command.guild?.id) return;

    try {
      const memberModels = await this._userService.getUsersLeveling(
        command.guild.id
      );

      const coinsTopEmbed = new FieldsEmbed<UserModel>();

      coinsTopEmbed.embed
        .setAuthor("Experience leaderboard", EXP_ICON)
        .setColor("#FFFFFF");

      return await coinsTopEmbed
        .setAuthorizedUsers([command.author.id])
        .setChannel(
          command.channel as Exclude<typeof command.channel, NewsChannel>
        )
        .setClientAssets({ prompt: "Hey, {{user}}, pick a number of page!" })
        .setArray(memberModels)
        .setElementsPerPage(15)
        .setPageIndicator(false)
        .formatField("User", (el) => `<@${el.userId}>`)
        .formatField("Level", (el) => `\`${el.level}\``)
        .formatField(
          "Exp.",
          (el) => `\`${el.experience}/${NEXT_LEVEL_XP(el.level)}\``
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
      LoggerFactory.get(Top).error(e.message);
      return await MessageHelpers.sendPublicError(
        command.channel as TextChannel,
        "I'm not enough permitted in this guild to perform that action :("
      );
    }
  }
}
