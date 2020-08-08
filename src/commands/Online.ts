import { Command, CommandMessage, Guard, Infos, Rules } from "@typeit/discord";
import { GuildMember, MessageEmbed } from "discord.js";
import * as console from "console";
import { ServerDataItem, MystBot } from "../MystBot";
import { NotBot, ThrottleMessage } from "../guards";

// TODO: refactor
export abstract class Online {
  @Command("guild")
  @Rules("online")
  @Infos<CommandInfo>({
    description: "todo",
    category: "Guild",
    coreCommand: true,
    usages: "guild",
  })
  @Guard(NotBot(), ThrottleMessage())
  async runOnline(command: CommandMessage) {
    let onlineMembers = 0;
    let onlineActiveMembers = 0;
    let allActiveMembers = 0;

    const members = command.guild?.members.cache;

    const activeRoleSnowflake =
      MystBot.config.roles.find(
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
      .setTitle(`${command.guild?.name} stats`)
      .addField(
        "Members",
        `All: ${members?.size ?? -1}\nOnline: ${onlineMembers}`,
        true
      )
      .addField(
        "Active",
        `All: ${allActiveMembers}\nOnline: ${onlineActiveMembers}`,
        true
      )
      .setColor("#FFFFFF");

    return await command.channel.send({ embed: messageEmbed });
  }
}
