import { GuardFunction } from "@typeit/discord";
import { PermissionName } from "mystbot";
import { Container } from "typescript-ioc";
import { PermissionsManager } from "../logic/PermissionsManager";
import { MessageHelpers } from "../utils/MessageHelpers";

export const Permitted = (permissionNames: PermissionName[]) => {
  const guard: GuardFunction<"commandMessage"> = async (
    [message],
    client,
    next
  ) => {
    if (!message.guild)
      throw new Error("Guard error: Command allowed only in guild");

    const pm = Container.get(PermissionsManager);
    let permitted = false;

    if (
      message.author.id === message.guild.ownerID ||
      (await pm.authorHasPermissions(
        message.guild,
        message.author,
        permissionNames
      ))
    ) {
      permitted = true;
    }

    permitted &&
      (await MessageHelpers.sendAndDelete(message, "not enough permissions!"));

    permitted && (await next());
  };

  return guard;
};
