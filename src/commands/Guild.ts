import { Command, CommandMessage, Guard, Infos } from "@typeit/discord";
import { GuildMember, MessageEmbed } from "discord.js";
import * as console from "console";
import { InGuildOnly, NotBot, ThrottleMessage } from "../guards";

// TODO: refactor
export abstract class Guild {
  @Command("guild")
  @Infos<CommandInfo>({
    description: "todo",
    category: "Guild",
    coreCommand: true,
    usages: "guild",
  })
  @Guard(NotBot(), InGuildOnly(), ThrottleMessage())
  async runOnline(command: CommandMessage) {
    let onlineMembers = 0;
    let onlineActiveMembers = 0;
    let allActiveMembers = 0;

    const members = command.guild?.members.cache;

    // TODO: rework role counter
    const activeRoleSnowflake = "";

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
