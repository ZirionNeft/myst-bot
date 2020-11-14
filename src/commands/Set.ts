import { Command, CommandMessage, Guard, Infos } from "@typeit/discord";
import {
  InGuildOnly,
  NotBot,
  NotBotMentionInArgs,
  Permitted,
  ThrottleMessage,
} from "../guards";
import {
  RawSnowflake,
  Setting as SettingName,
  SettingValueType,
} from "mystbot";
import SettingService from "../services/SettingService";
import { Inject } from "typescript-ioc";
import { Guild } from "discord.js";
import * as TypeGuards from "../utils/TypeGuards";
import { MessageHelpers } from "../utils/MessageHelpers";
import { StringHelpers } from "../utils/StringHelpers";
import LoggerFactory from "../utils/LoggerFactory";
import BotHelpers from "../utils/BotHelpers";

export abstract class Set {
  @Inject
  private _settingService!: SettingService;

  @Command("set :settingName :settingValue")
  @Infos<CommandInfo>({
    description: "Guild scoped bot configuration",
    category: "Admin",
    coreCommand: true,
    usages: "set <setting_name> <setting_value>",
  })
  @Guard(
    NotBot(),
    InGuildOnly(),
    Permitted(["ChangeSettings"]),
    ThrottleMessage(),
    NotBotMentionInArgs()
  )
  async runSet(command: CommandMessage) {
    const {
      settingName,
      settingValue,
    }: {
      settingName: SettingName;
      settingValue: unknown;
    } = command.args;

    try {
      if (!settingName || !settingValue)
        return await MessageHelpers.sendPublicNote(
          command,
          `wrong arguments. Command usage: \`${command.infos.usages}\``
        );

      if (String(settingValue).length > 32) {
        return await MessageHelpers.sendPublicNote(
          command,
          "maximum length of value is 32 chars"
        );
      }

      const guildId = (command.guild as Guild).id;

      const [validatedName, validatedValue]: [
        SettingName | null,
        SettingValueType<typeof settingName> | null
      ] = this._validatedTypes(settingName, settingValue);

      if (!validatedValue || !validatedName) {
        const error = !validatedName
          ? "This setting name not found! "
          : !validatedValue
          ? `Wrong setting value type. `
          : "";
        return MessageHelpers.sendPublicNote(
          command,
          `${error}Use \`${await BotHelpers.getGuildPrefix(
            guildId
          )}help set\` to display full list of all possible settings`
        );
      }

      const upsertResult = await this._settingService.upsert({
        guildId,
        name: validatedName,
        value: validatedValue.toString(),
      });

      if (upsertResult) {
        await command.react("✅");
      } else {
        LoggerFactory.get(Set).warn(`${guildId} - Setting is not updated`);
      }
    } catch (e) {
      LoggerFactory.get(Set).error(e);
    }
  }

  private _validatedTypes(
    name: SettingName,
    value: unknown
  ): [SettingName | null, RawSnowflake | number | string | null] {
    try {
      // Iterate all over possible types of setting value
      for (const type of ["RawSnowflake", "number", "string"]) {
        // Check that a value is matching with type bounded in setting name
        const temp = TypeGuards.isSettingNameTypeMatch(
          StringHelpers.capitalize((name as unknown) as string),
          type
        );
        if (temp) {
          if (
            Reflect.apply(
              TypeGuards[`is${StringHelpers.capitalize(type)}`],
              this,
              [value]
            )
          ) {
            switch (type) {
              case "RawSnowflake":
                return [name, value as RawSnowflake];
              case "number":
                return [name, value as number];
              case "string":
                return [name, value as string];
            }
          } else {
            return [name as SettingName, null];
          }
        }
      }
    } catch (e) {
      LoggerFactory.get(Set).error(e);
    }

    return [null, null];
  }
}
