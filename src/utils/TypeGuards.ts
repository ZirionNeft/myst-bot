import { RawSnowflake, Setting } from "mystbot";
import { StringHelpers } from "./StringHelpers";

const SettingsTypeGuards = {
  RawSnowflake: ["StaffChannelId", "InfoChannelId"] as const,
  number: [] as const,
  string: ["Prefix"] as const,
};

export function isRawSnowflake(value: unknown): value is RawSnowflake {
  return (
    typeof value === "string" &&
    StringHelpers.getSnowflakeFromMention(value, true) !== undefined
  );
}

export function isNumber(value: unknown): value is number {
  return typeof value === "number";
}

export function isString(value: unknown): value is string {
  return typeof value === "string";
}

export function isSettingNameTypeMatch(
  name: unknown,
  type: string
): name is Setting {
  return typeof name === "string" && SettingsTypeGuards[type][name];
}
