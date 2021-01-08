import { Message, MessageEmbed } from "discord.js";
import { Inject } from "typescript-ioc";
import { config } from "node-config-ts";
import { ApplyOptions } from "@sapphire/decorators";
import { Args, BucketType, Command, CommandOptions } from "@sapphire/framework";
import UserService from "../../lib/services/UserService";
import { MystCommand } from "../../lib/structures/MystCommand";
import { StringHelpers } from "../../lib/utils/StringHelpers";

export interface IGuildCommand extends Command {}

@ApplyOptions<CommandOptions>({
  name: "guild",
  aliases: ["server"],
  description: "Information about guild",
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
  usages: "guild",
  category: "Guild",
})
export class GuildCommand extends MystCommand implements IGuildCommand {
  @Inject
  private userService!: UserService;

  public async run(message: Message, args: Args) {
    const messageEmbed = new MessageEmbed();

    const hidden = "[hidden]";
    const guild = message.guild;
    const owner = guild?.owner;

    messageEmbed
      .setTitle(guild?.name ?? "[server name is unknown]")
      .setColor("PURPLE")
      .setDescription(`\`\`\`Guild ID: ${guild?.id ?? hidden}\`\`\``)
      .setThumbnail(guild?.iconURL() ?? "")
      .addField(
        "Region",
        StringHelpers.capitalize(guild?.region) ?? hidden,
        true
      )
      .addField("Members", guild?.memberCount ?? hidden, true)
      .addField("Roles", guild?.roles.cache.size ?? hidden, true)
      .addField("Shard", guild?.shard.id ?? hidden, true)
      .addField("Channels", guild?.channels.cache.size ?? hidden, true)
      .addField(
        "Owner",
        `${
          owner ? `${owner.user.username}#${owner.user.discriminator}` : hidden
        }`,
        true
      )
      .addField(
        "When Created",
        guild?.createdAt.toUTCString() ?? hidden,
        false
      );

    return await message.channel.send({ embed: messageEmbed });
  }
}
