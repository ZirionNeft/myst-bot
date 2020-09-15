import { Inject, OnlyInstantiableByContainer, Singleton } from "typescript-ioc";
import UserService from "../services/UserService";
import { Message, Snowflake } from "discord.js";
import Logger from "../utils/Logger";
import { UserCreationAttributes } from "../database/models/User.model";
import GuildService from "../services/GuildService";
import Timeout = NodeJS.Timeout;

const FLUSH_INTERVAL = 30000;

export const NEXT_LEVEL_XP = (level: Level): Experience => {
  const exponent = 1.6;
  const baseXP = 800;
  return Math.floor(baseXP * (level ^ exponent));
};

type Experience = number;
type Level = number;

export type ExperienceKey = string;

export interface ExperienceValue {
  experience: Experience;
  level: Level;
}

@Singleton
@OnlyInstantiableByContainer
export default class UserLeveling {
  @Inject
  private _userService!: UserService;

  @Inject
  private _guildService!: GuildService;

  private _expBuffer: Map<ExperienceKey, ExperienceValue>;

  private _interval: Timeout | null;

  private static _logger = Logger.get(UserLeveling);

  constructor() {
    this._interval = null;
    this._expBuffer = new Map();
  }

  async resolve({
    author,
    content,
    guild,
  }: Message): Promise<ExperienceValue | undefined> {
    const symbolsLength = content.trim().length;
    if (!symbolsLength || !guild) {
      return;
    }

    const experienceKey: ExperienceKey = `${author.id}:${guild.id}`;

    try {
      let experienceValue: ExperienceValue;

      if (this._expBuffer.has(experienceKey)) {
        const value = this._expBuffer.get(experienceKey);
        experienceValue = {
          experience: (value?.experience ?? 0) + symbolsLength,
          level: value?.level ?? 0,
        };
      } else {
        // Before we try to create the user, we must to check that the guild is exist
        await this._guildService.findOneOrCreate(guild.id);

        const userEntity = await this._userService.findOneOrCreate(
          author.id,
          guild.id
        );
        experienceValue = {
          experience: userEntity.experience + symbolsLength,
          level: userEntity.level,
        };
      }

      this._expBuffer.set(experienceKey, experienceValue);

      if (!this._interval) {
        this._interval = setInterval(
          this._flushCallback.bind(this),
          FLUSH_INTERVAL
        );
      }

      return experienceValue;
    } catch (e) {
      UserLeveling._logger.error(e);
    }

    return;
  }

  private async _flushCallback() {
    try {
      const size = this._expBuffer.size;

      if (size) {
        const userEntities = Array.from(this._expBuffer.entries()).map(
          ([key, value]: [ExperienceKey, ExperienceValue]) => {
            const s: Snowflake[] = key.split(":");
            return {
              userId: s[0],
              guildId: s[1],
              ...UserLeveling._calculateLevel(value),
            } as UserCreationAttributes;
          }
        );
        await this._userService.bulkUpdateOrCreate(...userEntities);

        UserLeveling._logger.debug(`User experience positions sent: %d`, size);

        this._clear();
      }
    } catch (e) {
      UserLeveling._logger.error(e);
      this._clear();
    }
  }

  private _clear() {
    this._expBuffer.clear();
    UserLeveling._logger.debug("User experience buffer flushed");
  }

  private static _calculateLevel({
    experience,
    level,
  }: ExperienceValue): ExperienceValue {
    for (
      let nextLevelXp = NEXT_LEVEL_XP(level);
      experience >= nextLevelXp;
      nextLevelXp = NEXT_LEVEL_XP(level)
    ) {
      experience -= nextLevelXp;
      level++;
    }
    return { level, experience };
  }
}
