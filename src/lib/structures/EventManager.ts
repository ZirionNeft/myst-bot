import { OnlyInstantiableByContainer, Singleton } from "typescript-ioc";
import { EventEmitter } from "events";
import { Snowflake } from "discord.js";
import { ExperienceDTO } from "./GuildLevelingFactory";

@Singleton
@OnlyInstantiableByContainer
export default class EventManager {
  private _eventEmitter: NodeJS.EventEmitter;

  constructor() {
    this._eventEmitter = new EventEmitter();
  }

  subscribe<E extends BusinessEvent>(
    event: E,
    callback: (args: BusinessEventArgs<E>) => void
  ) {
    this._eventEmitter.on(event, callback);
  }

  notify<E extends BusinessEvent>(event: E, args: BusinessEventArgs<E>) {
    this._eventEmitter.emit(event, args);
  }
}

export interface Subscriber<T extends BusinessEvent> {
  handle(args: BusinessEventArgs<T>);
}

type UserId = Snowflake;
type GuildId = Snowflake;
interface BusinessEvents {
  levelUp: [UserId, GuildId, ExperienceDTO];
}

export type BusinessEvent = keyof BusinessEvents;

export type BusinessEventArgs<K extends BusinessEvent> = BusinessEvents[K];
