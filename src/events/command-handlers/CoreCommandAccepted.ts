import type { PieceContext } from "@sapphire/pieces";
import { Event, CommandAcceptedPayload, Events } from "@sapphire/framework";

export class CoreEvent extends Event<Events.CommandAccepted> {
  public constructor(context: PieceContext) {
    super(context, { event: Events.CommandAccepted });
  }

  public async run({
    message,
    command,
    parameters,
    context,
  }: CommandAcceptedPayload) {
    const args = await command.preParse(message, parameters);
    if (command)
      try {
        this.client.emit(Events.CommandRun, message, command);
        const result = await command.run(message, args, context);
        this.client.emit(Events.CommandSuccess, {
          message,
          command,
          result,
          parameters,
        });
      } catch (error) {
        this.client.emit(Events.CommandError, error, {
          piece: command,
          message,
        });
      } finally {
        this.client.emit(Events.CommandFinish, message, command);
      }
  }
}
