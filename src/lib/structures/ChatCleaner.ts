import type { Message } from "discord.js";
import LoggerFactory from "../utils/LoggerFactory";

export interface DeletableMessage {
	message: Message;
	sec?: number;
}

// TODO: WIP

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class ChatCleaner {
	public static async clean(...messages: DeletableMessage[]) {
		try {
			let counter = 0;
			const guildsBuffer = new Set();
			const promises = [];

			for (const m of messages) {
				promises.push(
					m.message
						.delete({
							timeout:
								(typeof m.sec === "number" ? m.sec : 5) * 1000,
						})
						.then((msg) => {
							if (messages.length <= 1)
								LoggerFactory.get(ChatCleaner).trace(
									`Message deleted -- <${msg.id}>`
								);
							else counter++;
							msg.guild && guildsBuffer.add(msg.guild.id);
						})
				);
			}
			return Promise.all(promises).finally(() => {
				counter &&
					LoggerFactory.get(ChatCleaner).info(
						`Messages cleaned [${counter}] in guilds [${Array.from(
							guildsBuffer.values(),
							(v) => `<${v}>`
						).join(",")}]>`
					);
			});
		} catch (e) {
			LoggerFactory.get(ChatCleaner).error(e);
			return e;
		}
	}
}
