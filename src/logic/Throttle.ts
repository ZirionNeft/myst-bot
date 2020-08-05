import { Snowflake, User } from "discord.js";
import { OnlyInstantiableByContainer, Singleton } from "typescript-ioc";
import Timeout = NodeJS.Timeout;

export interface ThrottleTimer {
  userId: Snowflake;
  timer: Timeout;
}

const PAUSE_BETWEEN_COMMANDS = +(process.env.PAUSE_BETWEEN_COMMANDS ?? 3000);

@Singleton
@OnlyInstantiableByContainer
export default class Throttle {
  private _timers: ThrottleTimer[];

  constructor() {
    this._timers = [];
  }

  public async make(userId: Snowflake): Promise<boolean> {
    if (await this.hasTimer(userId)) {
      return true;
    } else {
      this._timers.push({
        userId,
        timer: setTimeout(
          () =>
            this._timers.splice(
              this._timers.findIndex((o) => o.userId === userId),
              1
            ),
          PAUSE_BETWEEN_COMMANDS
        ),
      });
    }
    return false;
  }

  public async hasTimer(userId: Snowflake) {
    return this._timers.find((t) => t.userId === userId);
  }
}
