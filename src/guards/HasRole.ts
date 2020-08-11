import { GuardFunction } from "@typeit/discord";
import { Snowflake } from "discord.js";

export const HasRole = (roleId: Snowflake) => {
  const guard: GuardFunction<"commandMessage"> = async (
    [message],
    client,
    next
  ) => {
    if (message.member?.roles.cache.find((r) => r.id === roleId)) await next();
  };

  return guard;
};
