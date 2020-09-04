import { Message } from "discord.js";
import Logger from "../utils/Logger";
import { CommandMessage } from "@typeit/discord";
import { config } from "node-config-ts";

export interface DeletableMessage {
  message: Message | CommandMessage;
  sec?: number;
}

export default class ChatCleaner {
  private static _logger = Logger.get(ChatCleaner);

  static clean(...messages: DeletableMessage[]) {
    try {
      let counter = 0;
      const g = new Set();

      for (let m of messages) {
        m.message
          .delete({
            timeout: (typeof m.sec === "number" ? m.sec : 5) * 1000,
          })
          .then((msg) => {
            if (messages.length <= 1)
              ChatCleaner._logger.debug(`Message deleted -- <${msg.id}>`);
            else counter++;
            msg.guild && g.add(msg.guild.id);
          });
      }
      counter &&
        ChatCleaner._logger.info(
          `Messages cleaned [${counter}] in guilds [${Array.from(
            g.values(),
            (v) => `<${v}>`
          ).join(",")}]>`
        );
    } catch (e) {
      config.general.debug && ChatCleaner._logger.error(e);
    }
  }
}
