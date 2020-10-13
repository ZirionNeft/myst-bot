import { GuardFunction } from "@typeit/discord";
import { PermissionName } from "mystbot";
import { Container } from "typescript-ioc";
import { PermissionsManager } from "../logic/PermissionsManager";

export const Permitted = (permissionNames: PermissionName[]) => {
  const guard: GuardFunction<"commandMessage"> = async (
    [message],
    client,
    next
  ) => {
    if (!message.guild)
      throw new Error("Guard error: Command allowed only in guild");

    // TODO

    const pm = Container.get(PermissionsManager);
    let permitted = false;

    // if (
    //   message.author.id === message.guild.ownerID ||
    //   (await pm.authorHasPermissions(
    //     message.guild,
    //     message.author,
    //     permissionNames
    //   ))
    // ) {
    //   permitted = true;
    // }

    permitted && (await next());
  };

  return guard;
};
