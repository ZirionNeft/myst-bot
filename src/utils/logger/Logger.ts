import P from "pino";

export default class Logger {
  private static _logger: P.Logger = P({
    prettyPrint: { colorize: true },
    level: process.env.DEBUG === "true" ? "debug" : "info",
  });

  public static get<T>(context: T): P.Logger {
    return this._logger.child({
      class: context,
    });
  }
}
