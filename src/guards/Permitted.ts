import { GuardFunction } from "@typeit/discord";

export const Permitted = () => {
  const guard: GuardFunction<"commandMessage"> = async (
    [message],
    client,
    next
  ) => {
    await next();
  };

  return guard;
};
