import { Subscribe } from "../decorators/Subscribe";
import { BusinessEventArgs, Subscriber } from "mystbot";
import Logger from "../utils/Logger";
import { Inject, OnlyInstantiableByContainer } from "typescript-ioc";
import GuildService from "../services/GuildService";
import { MessageHelpers } from "../utils/MessageHelpers";
import { MessageEmbed } from "discord.js";

@OnlyInstantiableByContainer
export class LevelUpSubscriber implements Subscriber<"levelUp"> {
  private static _logger = Logger.get(LevelUpSubscriber);

  @Inject
  private _guildService!: GuildService;

  @Subscribe("levelUp")
  async handle([userId, guildId, experienceDTO]: BusinessEventArgs<"levelUp">) {
    LevelUpSubscriber._logger.debug(userId, guildId, experienceDTO);

    await MessageHelpers.sendInInfoChannel(
      guildId,
      new MessageEmbed()
        .setDescription(
          `<@${userId}> just leveled up [**${
            experienceDTO.level - 1
          }**] --> [**${experienceDTO.level}**], yeee!`
        )
        .setColor("GOLD")
    );
  }
}
