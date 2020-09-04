import { GuardFunction } from "@typeit/discord";
import { MessageHelpers } from "../utils/MessageHelpers";
import { config } from "node-config-ts";

export const NotBotMentionInArgs = () => {
  const guard: GuardFunction<"commandMessage"> = async (
    [message],
    client,
    next
  ) => {
    if (
      config.bot.allowBotMentionInCommands ||
      !(message.commandContent && message.mentions.users.some((v) => v.bot))
    )
      await next();
    else
      await MessageHelpers.sendPublicNote(
        message,
        "bots can't be used in commands"
      );
  };

  return guard;
};
