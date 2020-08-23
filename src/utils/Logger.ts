import P from "pino";
import { AppArgs } from "./AppArgs";

export default class Logger {
  private static _logger: P.Logger;

  public static get<T extends Function>(context: T): P.Logger {
    let level: string | undefined = AppArgs.args["log-level"];

    if (level && !P.levels.values[level]) level = undefined;

    if (!this._logger) {
      this._logger = P({
        prettyPrint: {
          colorize: true,
          messageFormat: "<{context}> -- {msg}",
          translateTime: "SYS:yyyy-mm-dd HH:MM:ss.l",
          ignore: "context",
        },
        level: level ?? (process.env.DEBUG === "true" ? "debug" : "info"),
      });
    }

    return this._logger.child({
      context: context.name,
    });
  }
}
