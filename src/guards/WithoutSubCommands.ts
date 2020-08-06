import { GuardFunction } from "@typeit/discord";

export const WithoutSubCommands = (excludedSubCommands?: string[]) => {
  const guard: GuardFunction<"commandMessage"> = async (
    [message],
    client,
    next
  ) => {
    // check is for prevent multiple command executing
    if (!excludedSubCommands?.includes(message.commandContent.split(" ")[1]))
      await next();
  };

  return guard;
};
