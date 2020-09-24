import GuildLevelingFactory from "./GuildLevelingFactory";
import {
  Container,
  OnlyInstantiableByContainer,
  Singleton,
} from "typescript-ioc";
import { Message, Snowflake } from "discord.js";
import { ExperienceDTO } from "mystbot";

@Singleton
@OnlyInstantiableByContainer
export default class LevelingManager {
  private _guildLevelingBuffer: Map<Snowflake, GuildLevelingFactory>;

  constructor() {
    this._guildLevelingBuffer = new Map();
  }

  async resolve({
    guild,
    author,
    content,
  }: Message): Promise<ExperienceDTO | undefined> {
    if (!guild) return;

    let guildLevelingFactory: GuildLevelingFactory | undefined;
    if (this._guildLevelingBuffer.has(guild.id)) {
      guildLevelingFactory = this._guildLevelingBuffer.get(guild.id);
    } else {
      guildLevelingFactory = Container.get(GuildLevelingFactory);
      guildLevelingFactory.guildId = guild.id;
      this._guildLevelingBuffer.set(guild.id, guildLevelingFactory);
    }

    return guildLevelingFactory?.resolve(author, content);
  }

  async flushAll() {
    return Promise.all([
      [...this._guildLevelingBuffer.values()].map((guildLevelingFactory) =>
        guildLevelingFactory.flush()
      ),
    ]);
  }

  async flush(guildId: Snowflake) {
    return this._guildLevelingBuffer.get(guildId)?.flush();
  }
}
