import P from "pino";
import { config } from "node-config-ts";
import { Constructor } from "mystbot";
import { LogLevel, ILogger } from "@sapphire/framework";

type Logger = P.Logger & ILogger;

export default class LoggerFactory {
  private static _logger: P.Logger;

  public static get<T extends Constructor>(context: T | Function): Logger {
    let level: string | undefined = config.general.loglevel;

    if (level && !P.levels.values[level]) level = undefined;

    if (!this._logger) {
      this._logger = P({
        prettyPrint: {
          colorize: true,
          messageFormat: "<{context}> -- {msg}",
          translateTime: "SYS:yyyy-mm-dd HH:MM:ss.l",
          ignore: "context",
        },
        level: level ?? (config.general.debug ? "debug" : "info"),
      });
    }

    const child = this._logger.child({
      context: context.name,
    }) as Logger;

    // A weird workaround to extend a Pino instance with 'write' method, which is required by ILogger interface from Sapphire
    Object.defineProperties(child, {
      write: {
        value: (level: LogLevel, ...values: readonly unknown[]) => {
          const [firstArg, ...other] = values;
          // @ts-ignore
          child[LogLevel[level]]((firstArg as string) ?? "", ...other);
        },
      },
    });

    return child;
  }
}
