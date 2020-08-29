import { GuardFunction } from "@typeit/discord";
import { GuardData } from "../globals";
import ChatCleaner from "../logic/ChatCleaner";

export const DeleteAfterDelay = (sec?: number) => {
  const guard: GuardFunction<"commandMessage"> = async (
    [message],
    client,
    next,
    guardData: GuardData
  ) => {
    ChatCleaner.clean({
      message,
      sec: sec ?? 3,
    });
    await next();
  };

  return guard;
};
