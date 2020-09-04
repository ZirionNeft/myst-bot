import { Snowflake, User } from "discord.js";
import { OnlyInstantiableByContainer, Singleton } from "typescript-ioc";
import Timeout = NodeJS.Timeout;
import * as process from "process";
import { config } from "node-config-ts";

export interface ThrottleTimer {
  userId: Snowflake;
  timer: Timeout;
}

@Singleton
@OnlyInstantiableByContainer
export default class Throttle {
  private _timers: ThrottleTimer[];

  constructor() {
    this._timers = [];
  }

  public async make(userId: Snowflake): Promise<boolean> {
    const t = await this.hasTimer(userId);
    if (!t) {
      this._timers.push({
        userId,
        timer: setTimeout(
          () =>
            this._timers.splice(
              this._timers.findIndex((o) => o.userId === userId),
              1
            ),
          config.bot.commandCoolDown ?? 3000
        ),
      });
    }
    return t;
  }

  public async hasTimer(userId: Snowflake) {
    return !!this._timers.find((t) => t.userId === userId);
  }
}
