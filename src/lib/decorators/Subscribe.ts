import { Container } from "typescript-ioc";
import EventManager from "../structures/EventManager";
import { BusinessEvent } from "mystbot";

export function Subscribe(event: BusinessEvent) {
  const eventManager = Container.get(EventManager);

  return (target: Object, key?: string, descriptor?: PropertyDescriptor) => {
    eventManager.subscribe(event, descriptor?.value);
  };
}
