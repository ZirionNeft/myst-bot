import { OnlyInstantiableByContainer, Singleton } from "typescript-ioc";
import { EventEmitter } from "events";
import { BusinessEvent, BusinessEventArgs } from "mystbot";

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
