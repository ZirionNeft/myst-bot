import { Command, CommandMessage, Guard, Infos } from "@typeit/discord";
import { InGuildOnly, NotBot, ThrottleMessage } from "../guards";
import { MystBotClient } from "../MystBotClient";
import { MessageEmbed, Snowflake, TextChannel } from "discord.js";
import { Inject } from "typescript-ioc";
import EmojiService from "../services/EmojiService";
import { MessageHelpers } from "../utils/MessageHelpers";
import { Embeds, PaginationEmbed } from "discord-paginationembed";
import LoggerFactory from "../utils/LoggerFactory";

export abstract class Emoji {
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
      if (!command.guild) return;

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
      LoggerFactory.get(Emoji).error(e);
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
}
