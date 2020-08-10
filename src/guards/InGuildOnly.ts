import { GuardFunction } from "@typeit/discord";
import { DMChannel } from "discord.js";

export const InGuildOnly = () => {
  const guard: GuardFunction<"commandMessage"> = async (
    [message],
    client,
    next
  ) => {
    if (!(message.channel instanceof DMChannel) && message.guild) await next();
  };

  return guard;
};
