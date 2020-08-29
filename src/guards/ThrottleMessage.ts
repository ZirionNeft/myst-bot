import { GuardFunction } from "@typeit/discord";
import Throttle from "../logic/Throttle";
import { Container } from "typescript-ioc";
import { MessageHelpers } from "../utils/MessageHelpers";

export const ThrottleMessage = (excludedSubCommands?: string[]) => {
  const guard: GuardFunction<"commandMessage"> = async (
    [message],
    client,
    next
  ) => {
    const throttle: Throttle = Container.get(Throttle);

    if (await throttle.make(message.author.id)) {
      await MessageHelpers.sendAndDelete(message, "> Please cool down!");
    } else await next();
  };

  return guard;
};
