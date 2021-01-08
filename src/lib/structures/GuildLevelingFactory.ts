import { Factory, Inject, OnlyInstantiableByContainer } from "typescript-ioc";
import UserService from "../services/UserService";
import { Snowflake, User } from "discord.js";
import LoggerFactory from "../utils/LoggerFactory";
import { UserCreationAttributes } from "../database/models/User.model";
import GuildService from "../services/GuildService";
import EventManager from "./EventManager";
import Timeout = NodeJS.Timeout;

const FLUSH_INTERVAL = 30000;

export type ExperienceBufferKey = Snowflake;

export function calculateNextLevelXp(level: Level): Experience {
  const exponent = 1.5;
  const baseXP = 500;
  return Math.floor(baseXP * Math.pow(level, exponent));
}

// TODO: refactor interfaces names
interface IExtendedExpDTO extends ExperienceDTO {
  nextLevelExp: Experience;
}
export interface ExperienceDTO {
  experience: Experience;
  level: Level;
}
type Experience = number;
type Level = number;

@Factory(() => new GuildLevelingFactory())
@OnlyInstantiableByContainer
export default class GuildLevelingFactory {
  @Inject
  private _userService!: UserService;

  @Inject
  private _guildService!: GuildService;

  @Inject
  private _eventManager!: EventManager;

  private _expBuffer: Map<ExperienceBufferKey, IExtendedExpDTO>;

  private _interval: Timeout | null;

  private _guildId!: Snowflake;

  constructor() {
    this._interval = null;
    this._expBuffer = new Map();
  }

  get guildId(): Snowflake {
    return this._guildId;
  }

  set guildId(value: Snowflake) {
    this._guildId = value;
  }

  async flush() {
    LoggerFactory.get(GuildLevelingFactory).info(
      "[Guild: %s] Experience buffer flushing...",
      this.guildId
    );
    await this._flushCallback();
  }

  async resolve(
    author: User,
    content: string
  ): Promise<ExperienceDTO | undefined> {
    if (!this._guildId)
      throw new Error("GuildLeveling resolving error: guildId not specified");

    const symbolsLength = content.trim().length;
    if (!symbolsLength) {
      return;
    }

    const experienceKey: ExperienceBufferKey = author.id;

    try {
      let experienceValue: IExtendedExpDTO;

      if (this._expBuffer.has(experienceKey)) {
        const value = this._expBuffer.get(experienceKey);
        experienceValue = {
          experience: (value?.experience ?? 0) + symbolsLength,
          level: value?.level ?? 1,
          nextLevelExp: calculateNextLevelXp(value?.level ?? 1),
        };
      } else {
        // Before we try to create the user, we must to check that the guild is exist
        await this._guildService.findOneOrCreate(this._guildId);

        const userEntity = await this._userService.findOneOrCreate(
          author.id,
          this._guildId
        );
        experienceValue = {
          experience: userEntity.experience + symbolsLength,
          level: userEntity.level,
          nextLevelExp: calculateNextLevelXp(userEntity.level),
        };
      }

      if (experienceValue.experience >= experienceValue.nextLevelExp) {
        const calculated = this._calculateLevel(author.id, experienceValue);
        experienceValue = {
          ...calculated,
          nextLevelExp: calculateNextLevelXp(calculated.level),
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
      LoggerFactory.get(GuildLevelingFactory).error(e);
    }

    return;
  }

  private async _flushCallback() {
    try {
      const size = this._expBuffer.size;

      if (size) {
        const userEntities = Array.from(this._expBuffer.entries()).map(
          ([key, value]: [ExperienceBufferKey, ExperienceDTO]) => {
            return {
              userId: key,
              guildId: this._guildId,
              ...this._calculateLevel(key, value),
            } as UserCreationAttributes;
          }
        );
        await this._userService.bulkUpdateOrCreate(...userEntities);

        LoggerFactory.get(GuildLevelingFactory).debug(
          `User experience positions sent: %d`,
          size
        );

        this._clear();
      }
    } catch (e) {
      LoggerFactory.get(GuildLevelingFactory).error(e);
      this._clear();
    }
  }

  private _clear() {
    this._expBuffer.clear();
    LoggerFactory.get(GuildLevelingFactory).debug(
      "User experience buffer flushed"
    );
  }

  private _calculateLevel(
    userId: Snowflake,
    { experience, level }: ExperienceDTO
  ): ExperienceDTO {
    for (
      let nextLevelXp = calculateNextLevelXp(level);
      experience >= nextLevelXp;
      nextLevelXp = calculateNextLevelXp(level)
    ) {
      experience -= nextLevelXp;
      level++;

      // TODO: refactor? - S-term of SOLID
      this._eventManager.notify("levelUp", [
        userId,
        this._guildId,
        { level, experience },
      ]);
    }
    return { level, experience };
  }
}
