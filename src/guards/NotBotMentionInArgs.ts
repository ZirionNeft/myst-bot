import { GuardFunction } from "@typeit/discord";
import { Utils } from "../Utils";

export const NotBotMentionInArgs = () => {
  const guard: GuardFunction<"commandMessage"> = async (
    [message],
    client,
    next
  ) => {
    if (
      process.env.ALLOW_BOTS_IN_COMMANDS === "true" ||
      !(message.commandContent && message.mentions.users.some((v) => v.bot))
    )
      await next();
    else await Utils.sendPublicNote(message, "bots can't be used in commands");
  };

  return guard;
};
