import { GuardFunction } from "@typeit/discord";
import ChatCleaner from "../logic/ChatCleaner";

export const DeleteAfterDelay = (sec?: number) => {
  const guard: GuardFunction<"message"> = async ([message], client, next) => {
    ChatCleaner.clean({
      message,
      sec: sec ?? 3,
    });
    await next();
  };

  return guard;
};
