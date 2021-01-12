import { Container } from "typescript-ioc";
import EventBus, { BusinessEvent } from "../structures/EventBus";

export function Subscribe(event: BusinessEvent) {
	const eventManager = Container.get(EventBus);

	return (
		_target: unknown,
		_key?: string,
		descriptor?: PropertyDescriptor
	) => {
		eventManager.subscribe(event, descriptor?.value);
	};
}
