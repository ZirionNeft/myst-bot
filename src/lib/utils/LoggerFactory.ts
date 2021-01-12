import P from "pino";
import { config } from "node-config-ts";
import type { LogLevel, ILogger } from "@sapphire/framework";

type Logger = P.Logger & ILogger;

// eslint-disable-next-line @typescript-eslint/ban-types
type Ctor<T = {}> = new (...args: any[]) => T;

// TODO: Refactor from static class to const function

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class LoggerFactory {
	private static logger: P.Logger;

	// eslint-disable-next-line @typescript-eslint/ban-types
	public static get<T extends Ctor>(context: T | Function): Logger {
		let level: string | undefined = config.general.loglevel;

		if (level && !P.levels.values[level]) level = undefined;

		if (!this.logger) {
			this.logger = P({
				prettyPrint: {
					colorize: true,
					messageFormat: "<{context}> -- {msg}",
					translateTime: "SYS:yyyy-mm-dd HH:MM:ss.l",
					ignore: "context",
				},
				level: level ?? (config.general.debug ? "debug" : "info"),
			});
		}

		const child = this.logger.child({
			context: context.name,
		}) as Logger;

		// A weird workaround to extend a Pino instance with 'write' method, which is required by ILogger interface from Sapphire
		Object.defineProperties(child, {
			write: {
				value: (level: LogLevel, ...values: readonly unknown[]) => {
					const [firstArg, ...other] = values;
					child[level]((firstArg as string) ?? "", ...other);
				},
			},
		});

		return child;
	}
}
