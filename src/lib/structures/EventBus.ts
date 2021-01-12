import { OnlyInstantiableByContainer, Singleton } from "typescript-ioc";
import { EventEmitter } from "events";
import type { Snowflake } from "discord.js";
import type { ExperienceDTO } from "./GuildLevelingFactory";
import type { Awaited } from "@sapphire/framework";

// TODO: Refactor?

@Singleton
@OnlyInstantiableByContainer
export default class EventBus {
	private _eventEmitter: NodeJS.EventEmitter;

	public constructor() {
		this._eventEmitter = new EventEmitter();
	}

	public subscribe<E extends BusinessEvent>(
		event: E,
		callback: (args: BusinessEventArgs<E>) => void
	) {
		this._eventEmitter.on(event, callback);
	}

	public notify<E extends BusinessEvent>(
		event: E,
		args: BusinessEventArgs<E>
	) {
		this._eventEmitter.emit(event, args);
	}
}

export interface Subscriber<T extends BusinessEvent> {
	handle(args: BusinessEventArgs<T>): Awaited<void>;
}

type UserId = Snowflake;
type GuildId = Snowflake;

interface BusinessEvents {
	levelUp: [UserId, GuildId, ExperienceDTO];
}

export type BusinessEvent = keyof BusinessEvents;

export type BusinessEventArgs<K extends BusinessEvent> = BusinessEvents[K];
