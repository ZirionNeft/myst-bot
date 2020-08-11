import { GuardFunction } from "@typeit/discord";
import { MessageHelpers } from "../utils/MessageHelpers";

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
    else
      await MessageHelpers.sendPublicNote(
        message,
        "bots can't be used in commands"
      );
  };

  return guard;
};
