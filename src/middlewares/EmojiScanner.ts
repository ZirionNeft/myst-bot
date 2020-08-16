import { GuardFunction } from "@typeit/discord";
import { EmojiData, GuardData } from "../globals";
import { StringHelpers } from "../utils/StringHelpers";

export const EmojiScanner = () => {
  const guard: GuardFunction<"commandMessage"> = async (
    [message],
    client,
    next,
    guardData: GuardData
  ) => {
    guardData.emojis = (
      message.content.match(/<a:.+?:\d+>|<:.+?:\d+>/g) || []
    ).map((e) => StringHelpers.getEmojiDataFromString(e) as EmojiData);
    await next();
  };

  return guard;
};
