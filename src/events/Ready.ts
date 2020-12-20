import { ApplyOptions } from "@sapphire/decorators";
import { Event, Events, EventOptions } from "@sapphire/framework";
import { getDatabase } from "../database/Database";
import LoggerFactory from "../utils/LoggerFactory";
import App from "../App";

@ApplyOptions<EventOptions>({ once: true })
export class UserEvent extends Event<Events.Ready> {
  public async run() {
    App.Client.database = await getDatabase();
    LoggerFactory.get(UserEvent).info(">>> Bot successfully started up!");
  }
}
