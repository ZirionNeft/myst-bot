import { ApplyOptions } from "@sapphire/decorators";
import { Event, Events, EventOptions } from "@sapphire/framework";
import { getDatabase } from "../database/Database";
import LoggerFactory from "../utils/LoggerFactory";
import { MystBotClient } from "../MystBotClient";
import { Guild } from "discord.js";
import { MessageHelpers } from "../utils/MessageHelpers";
import GuildService from "../services/GuildService";
import { Inject } from "typescript-ioc";

@ApplyOptions<EventOptions>({ once: true })
export class UserEvent extends Event<Events.GuildCreate> {
  @Inject
  private _guildService!: GuildService;

  public async run(guild: Guild) {
    try {
      await this._guildService.findOneOrCreate(guild.id);
    } catch (e) {
      LoggerFactory.get(MystBotClient).error(e);
      guild.owner ? await MessageHelpers.sendSystemErrorDM(guild.owner) : null;
    }
  }
}
