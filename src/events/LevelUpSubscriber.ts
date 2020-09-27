import { Subscribe } from "../decorators/Subscribe";
import { BusinessEventArgs, Subscriber } from "mystbot";
import LoggerFactory from "../utils/LoggerFactory";
import { Inject, OnlyInstantiableByContainer } from "typescript-ioc";
import GuildService from "../services/GuildService";
import { MessageHelpers } from "../utils/MessageHelpers";
import { MessageEmbed } from "discord.js";

@OnlyInstantiableByContainer
export class LevelUpSubscriber implements Subscriber<"levelUp"> {
  @Inject
  private _guildService!: GuildService;

  @Subscribe("levelUp")
  async handle([userId, guildId, experienceDTO]: BusinessEventArgs<"levelUp">) {
    await MessageHelpers.sendInInfoChannel.call(
      this,
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
