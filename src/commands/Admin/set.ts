import { Guild, Message } from "discord.js";
import { Inject } from "typescript-ioc";
import { config } from "node-config-ts";
import { ApplyOptions } from "@sapphire/decorators";
import {
  Args,
  BucketType,
  UserError,
  CommandOptions,
} from "@sapphire/framework";
import LoggerFactory from "../../lib/utils/LoggerFactory";
import { MystCommand } from "../../lib/structures/MystCommand";
import SettingService from "../../lib/services/SettingService";

export type TSettingName = keyof typeof SettingName;
export enum SettingName {
  "Prefix" = 1,
  "StaffChannelId",
  "InfoChannelId",
}

export enum SettingValueTypes {
  "Prefix" = "string",
  "StaffChannelId" = "textChannel",
  "InfoChannelId" = "textChannel",
}

@ApplyOptions<CommandOptions>({
  name: "set",
  aliases: ["setting", "config"],
  description: "Guild scoped bot configuration",
  preconditions: [
    "GuildOnly",
    {
      name: "Permitted",
      context: {
        permissionNames: ["ChangeSettings"],
      },
    },
    {
      name: "Cooldown",
      context: {
        bucketType: BucketType.Guild,
        delay: config.bot.commandCoolDown,
      },
    },
  ],
  usages: "set <setting_name> <setting_value>",
  category: "Admin",
})
export class SetCommand extends MystCommand {
  @Inject
  private _settingService!: SettingService;

  public async run(message: Message, args: Args) {
    const settingName = await args.pickResult("string");
    if (!settingName.success || !(settingName.value in SettingName))
      throw new UserError(
        "SetCommandArgumentError",
        "You must specify a setting name and setting value, and the first one did not match."
      );

    const settingValue = await args.pickResult(
      SettingValueTypes[settingName.value],
      { maximum: 32 }
    );
    if (!settingValue.success)
      throw new UserError(
        "SetCommandArgumentError",
        "You must specify a setting name and setting value, and the second one did not match."
      );

    try {
      const guildId = (message.guild as Guild).id;

      const upsertResult = await this._settingService.upsert({
        guildId,
        name: settingName.value as TSettingName,
        value: settingValue.value,
      });

      if (upsertResult) {
        await message.react("✅");
      } else {
        LoggerFactory.get(Set).warn(`${guildId} - Setting is not updated`);
      }
    } catch (e) {
      LoggerFactory.get(Set).error(e);
    }
  }
}
