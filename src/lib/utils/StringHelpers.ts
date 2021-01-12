import type { EmojiCounterDTO } from "../../events/Message";

// TODO: Refactor class to const functions instead static class

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export abstract class StringHelpers {
	public static getEmojiDataFromString(
		s: string
	): EmojiCounterDTO | undefined {
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

	public static capitalize(s: string | undefined): string | undefined {
		return s ? s.charAt(0).toUpperCase() + s.slice(1) : undefined;
	}
}
