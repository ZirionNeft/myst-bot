import { Command, CommandMessage, Guard, Infos } from "@typeit/discord";
import { NotBot, ThrottleMessage } from "../guards";
import { MystBot } from "../MystBot";

//https://discord.com/oauth2/authorize?client_id=729372307897712740&scope=bot&permissions=1494608983

export abstract class Invite {
  @Command("invite")
  @Infos<CommandInfo>({
    description: "Gets bot invite link",
    category: "Other",
    coreCommand: true,
    usages: "invite",
  })
  @Guard(NotBot(), ThrottleMessage())
  async runGuild(command: CommandMessage) {
    const inviteLink = `https://bit.ly/30OEi8G`;
    return await command.channel.send(
      `<:sparkles:743116500134658099> \`Invite me in your guild by link below, that\'s would be so awesome!\` \n**<${inviteLink}>**`
    );
  }
}
