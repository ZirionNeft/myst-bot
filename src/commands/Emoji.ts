import { Command, CommandMessage, Guard, Infos } from "@typeit/discord";
import { InGuildOnly, NotBot, ThrottleMessage } from "../guards";
import { MystBot } from "../MystBot";
import { MessageEmbed, Snowflake, TextChannel } from "discord.js";
import { Inject } from "typescript-ioc";
import EmojiService from "../services/EmojiService";
import { MessageHelpers } from "../utils/MessageHelpers";
import { Embeds, PaginationEmbed } from "discord-paginationembed";
import Logger from "../utils/Logger";

//https://discord.com/oauth2/authorize?client_id=729372307897712740&scope=bot&permissions=1494608983

interface EmojiDTO {
  id: Snowflake;
  name: string;
  counter: number;
}

export abstract class Emoji {
  private static _logger = Logger.get(Emoji);

  @Inject
  private _emojiService!: EmojiService;

  @Command("emoji")
  @Infos<CommandInfo>({
    description: "Shows usages count of every custom emoji on guild",
    category: "Guild",
    coreCommand: true,
    usages: "emoji",
  })
  @Guard(NotBot(), InGuildOnly(), ThrottleMessage())
  async runEmoji(command: CommandMessage) {
    try {
      if (!command.guild)
        return MessageHelpers.sendPublicError(
          command.channel as TextChannel,
          "Guild not found"
        );

      const statEmoji = (
        await this._emojiService.guildScoped(command.guild.id)
      ).map((e) => {
        const data = e.get();
        return {
          id: data.emojiId,
          counter: data.counter,
        };
      });
      const guildEmoji = command.guild.emojis.cache.map((e) => ({
        name: e.name,
        id: e.id,
        counter: statEmoji.find((s) => s.id === e.id)?.counter ?? 0,
        animated: e.animated,
      }));

      if (!guildEmoji.length)
        return MessageHelpers.sendPublicNote(
          command,
          "There is no emojis in the guild!"
        );

      const embeds: MessageEmbed[] = [];
      const emojiPerPage = 24;
      for (let i = 0; i < guildEmoji.length; i += emojiPerPage) {
        embeds.push(
          new MessageEmbed().addFields(
            guildEmoji.slice(i, i + emojiPerPage).map((d) => ({
              name: `<${d.animated ? "a" : ""}:${d.name}:${d.id}>`,
              value: `**${d.counter}**`,
              inline: true,
            }))
          )
        );
      }

      const paginatedEmbeds = new Embeds()
        .setArray(embeds)
        .setChannel(command.channel as TextChannel)
        .setColor("NAVY")
        .setTitle("Emoji Usage [Guild Only]")
        .setAuthorizedUsers([command.author.id]);

      return await paginatedEmbeds.build();
    } catch (e) {
      Emoji._logger.error(e);
      return (
        command.member &&
        MessageHelpers.sendSystemErrorDM(command.member, [
          {
            name: "Message",
            value: `${command.content}`,
          },
        ])
      );
    }
  }

  private async _collectEmojiData(guildId: Snowflake) {}
}
