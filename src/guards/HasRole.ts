import { GuardFunction } from "@typeit/discord";
import { ThunderBot } from "../ThunderBot";

export const HasRole = (roleName: string) => {
  const guard: GuardFunction<"commandMessage"> = async (
    [message],
    client,
    next
  ) => {
    if (
      message.member?.roles.cache.get(
        ThunderBot.config.stuffRoles.find((v) => v.name === roleName)?.value ??
          ""
      )
    )
      await next();
  };

  return guard;
};
