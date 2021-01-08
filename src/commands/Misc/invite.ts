import { Message } from "discord.js";
import { config } from "node-config-ts";
import { ApplyOptions } from "@sapphire/decorators";
import { Args, BucketType, CommandOptions } from "@sapphire/framework";
import { MystCommand } from "../../lib/structures/MystCommand";

@ApplyOptions<CommandOptions>({
  name: "invite",
  description: "Gets bot invite link",
  preconditions: [
    {
      name: "Cooldown",
      context: {
        bucketType: BucketType.Guild,
        delay: config.bot.commandCoolDown,
      },
    },
  ],
  usages: "invite",
  category: "Misc",
})
export class InviteCommand extends MystCommand {
  public async run(message: Message, args: Args) {
    const inviteLink = `https://bit.ly/30OEi8G`;
    return await message.channel.send(
      `<:sparkles:743116500134658099> \`Invite me in your guild by link below, that\'s would be so awesome!\` \n**<${inviteLink}>**`
    );
  }
}
