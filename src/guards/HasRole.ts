import { GuardFunction } from "@typeit/discord";
import { MystBot } from "../MystBot";

export const HasRole = (roleName: string) => {
  const guard: GuardFunction<"commandMessage"> = async (
    [message],
    client,
    next
  ) => {
    if (
      message.member?.roles.cache.get(
        MystBot.config.stuffRoles.find((v) => v.name === roleName)?.value ?? ""
      )
    )
      await next();
  };

  return guard;
};
