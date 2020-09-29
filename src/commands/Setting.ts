import { Command, CommandMessage, Guard, Infos } from "@typeit/discord";
import {
  InGuildOnly,
  NotBot,
  NotBotMentionInArgs,
  Permitted,
  ThrottleMessage,
} from "../guards";

export class Setting {
  @Command("set :settingName :settingValue")
  @Infos<CommandInfo>({
    description: "Settings",
    usages: "set <setting_name> <setting_value>",
    category: "Admin",
    coreCommand: true,
  })
  @Guard(
    NotBot(),
    InGuildOnly(),
    Permitted(),
    ThrottleMessage(),
    NotBotMentionInArgs()
  )
  async runSet(command: CommandMessage) {}
}
