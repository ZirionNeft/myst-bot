import { GuardFunction } from "@typeit/discord";
import { Emoji, GuardData } from "mystbot";
import { StringHelpers } from "../utils/StringHelpers";

export const EmojiScanner = () => {
  const guard: GuardFunction<"message"> = async (
    [message],
    client,
    next,
    guardData: GuardData
  ) => {
    guardData.emojis = [
      (message.content.match(/<a:.+?:\d+>|<:.+?:\d+>/g) || []).map(
        (e) => StringHelpers.getEmojiDataFromString(e) as Emoji
      ),
    ];
    await next();
  };

  return guard;
};
