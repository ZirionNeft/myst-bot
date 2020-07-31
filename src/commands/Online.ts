import { Command, CommandMessage, Rule, Rules } from "@typeit/discord";
import { GuildMember, MessageEmbed } from "discord.js";
import BaseCommand from "./BaseCommand";
import * as console from "console";
import { ThunderBot, ServerDataItem } from "../ThunderBot";

export abstract class Online extends BaseCommand {
  protected _onlyBotChannel = true;

  protected static _aliases = [
    "онлайн",
    "онлаин",
    "актив",
    "активные",
    "активных",
  ];

  @Command("online")
  @Rules(Rule(Online._aliases.join("|")).end())
  async runOnline(command: CommandMessage) {
    let onlineMembers = 0;
    let onlineActiveMembers = 0;
    let allActiveMembers = 0;

    const members = command.guild?.members.cache;

    const activeRoleSnowflake =
      ThunderBot.config.roles.find(
        (dataItem: ServerDataItem): boolean => dataItem.name === "active"
      )?.value ?? "-1";

    try {
      members?.forEach((member: GuildMember): void => {
        if (member.presence.status !== "offline") {
          onlineMembers++;
          if (member.roles.cache.has(activeRoleSnowflake)) {
            onlineActiveMembers++;
          }
        }
        if (member.roles.cache.has(activeRoleSnowflake)) {
          allActiveMembers++;
        }
      });
    } catch (e) {
      console.error(e);
    }

    const messageEmbed = new MessageEmbed()
      .setTitle("Статистика Russian Gamedev")
      .addField(
        "Всех",
        `Всего: ${members?.size ?? -1}\nОнлайн: ${onlineMembers}`,
        true
      )
      .addField(
        "Активных",
        `Всего: ${allActiveMembers}\nОнлайн: ${onlineActiveMembers}`,
        true
      )
      .setColor("#FFFFFF");

    return await command.channel.send({ embed: messageEmbed });
  }
}
