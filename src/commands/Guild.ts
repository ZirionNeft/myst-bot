import { Command, CommandMessage, Guard, Infos, Rules } from "@typeit/discord";
import { MessageEmbed } from "discord.js";
import { InGuildOnly, NotBot, ThrottleMessage } from "../guards";
import { MessageHelpers } from "../utils/MessageHelpers";

export abstract class Guild {
  @Command("guild")
  @Rules("server")
  @Infos<CommandInfo>({
    description: "Information about server",
    category: "Guild",
    coreCommand: true,
    usages: "guild",
  })
  @Guard(NotBot(), InGuildOnly(), ThrottleMessage())
  async runGuild(command: CommandMessage) {
    const messageEmbed = new MessageEmbed();

    const u = "[unknown]";
    const guild = command.guild;
    const owner = guild?.owner;

    messageEmbed
      .setTitle(guild?.name ?? "[server name is unknown]")
      .setColor("PURPLE")
      .setDescription(`\`\`\`Guild ID: ${guild?.id ?? u}\`\`\``)
      .setThumbnail(guild?.iconURL() ?? "")
      .addField("Region", MessageHelpers.capitalize(guild?.region) ?? u, true)
      .addField("Members", guild?.memberCount ?? u, true)
      .addField("Roles", guild?.roles.cache.size ?? u, true)
      .addField("Shard", guild?.shard.id ?? u, true)
      .addField("Channels", guild?.channels.cache.size ?? u, true)
      .addField(
        "Owner",
        `${owner ? `${owner.user.username}#${owner.user.discriminator}` : u}`,
        true
      )
      .addField("When Created", guild?.createdAt.toUTCString() ?? u, false);

    return await command.channel.send({ embed: messageEmbed });
  }
}
