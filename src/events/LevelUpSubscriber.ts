import { Subscribe } from "../decorators/Subscribe";
import { BusinessEventArgs, Subscriber } from "mystbot";
import Logger from "../utils/Logger";
import { OnlyInstantiableByContainer } from "typescript-ioc";

@OnlyInstantiableByContainer
export class LevelUpSubscriber implements Subscriber<"levelUp"> {
  private static _logger = Logger.get(LevelUpSubscriber);

  @Subscribe("levelUp")
  handle([userId, guildId, experienceDTO]: BusinessEventArgs<"levelUp">) {}
}
