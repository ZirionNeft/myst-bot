import { Snowflake } from "discord.js";
import { EmojiCounterDTO } from "../../events/Message";

export abstract class StringHelpers {
  static getEmojiDataFromString(s: string): EmojiCounterDTO | undefined {
    if (!s) return undefined;

    if (s.startsWith("<") && s.endsWith(">")) {
      s = s.slice(1, -1);

      const a = s.split(":");

      return {
        animated: a[0] === "a",
        name: a[1],
        id: a[2],
      };
    }
    return undefined;
  }

  static getSnowflakeFromMention(
    mention: string,
    strict?: boolean
  ): Snowflake | undefined {
    if (!mention) return undefined;

    if (strict) {
      if (!mention.match(/([0-9]{14,16})/)) return undefined;
    }

    if (mention.startsWith("<@") && mention.endsWith(">")) {
      mention = mention.slice(2, -1);

      if (mention.startsWith("!")) {
        mention = mention.slice(1);
      }

      return mention;
    }
    return undefined;
  }

  static capitalize(s: string | undefined): string | undefined {
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : undefined;
  }
}
