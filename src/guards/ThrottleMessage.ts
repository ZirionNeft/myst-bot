import { GuardFunction } from "@typeit/discord";
import Throttle from "../logic/Throttle";
import { Container } from "typescript-ioc";

export const ThrottleMessage = (excludedSubCommands?: string[]) => {
  const guard: GuardFunction<"commandMessage"> = async (
    [message],
    client,
    next
  ) => {
    const throttle: Throttle = Container.get(Throttle);

    if (await throttle.make(message.author.id)) {
      await message.channel.send("> Please cool down, sir!");
    } else await next();
  };

  return guard;
};
