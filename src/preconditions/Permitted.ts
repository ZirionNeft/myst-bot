import { PermissionName } from "mystbot";
import { Container } from "typescript-ioc";
import { PermissionsManager } from "../logic/PermissionsManager";
import { MessageHelpers } from "../utils/MessageHelpers";
import type { Message } from "discord.js";
import {
  AsyncPreconditionResult,
  Command,
  Precondition,
  PreconditionContext,
} from "@sapphire/framework";

export class Permitted extends Precondition {
  public async run(
    message: Message,
    command: Command,
    context: PreconditionContext
  ): AsyncPreconditionResult {
    const permissionNames: PermissionName[] = context.permissionNames as PermissionName[];

    if (!message.guild) return this.error("Command allowed only in guild");

    if (
      message.author.id === message.guild.ownerID ||
      (await Container.get(PermissionsManager).authorHasPermissions(
        message.guild,
        message.author,
        permissionNames
      ))
    ) {
      return this.ok();
    } else {
      await MessageHelpers.sendPublicNote(message, "not enough permissions!");
      return this.error("Not enough permissions!");
    }
  }
}
