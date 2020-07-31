import { GuardFunction } from "@typeit/discord";

export const NotBot = () => {
  const guard: GuardFunction<"commandMessage"> = async (
    [message],
    client,
    next
  ) => {
    if (!message.author.bot) await next();
  };

  return guard;
};
