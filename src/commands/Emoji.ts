import { Command, CommandMessage, Guard, Infos } from "@typeit/discord";
import { NotBot, ThrottleMessage } from "../guards";
import { MystBot } from "../MystBot";

//https://discord.com/oauth2/authorize?client_id=729372307897712740&scope=bot&permissions=1494608983

export abstract class Emoji {
  @Command("emoji")
  @Infos<CommandInfo>({
    description: "Shows usages count of every custom emoji on guild",
    category: "Guild",
    coreCommand: true,
    usages: "emoji",
  })
  @Guard(NotBot(), ThrottleMessage())
  async runGuild(command: CommandMessage) {}
}
