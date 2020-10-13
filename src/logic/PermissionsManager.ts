import { Inject, OnlyInstantiableByContainer, Singleton } from "typescript-ioc";
import PermissionService from "../services/PermissionService";
import { Guild, Snowflake, User } from "discord.js";
import { PermissionName } from "mystbot";
import LoggerFactory from "../utils/LoggerFactory";

type SpecifiedPermsStatus = { [K in Partial<PermissionName>]?: boolean };

@Singleton
@OnlyInstantiableByContainer
export class PermissionsManager {
  @Inject
  private _permissionService!: PermissionService;

  async authorHasPermissions(
    guild: Guild,
    author: User,
    permissionNames: PermissionName[]
  ) {
    const guildId = (guild as Guild).id;
    const authorId = author.id;

    const roles = (guild as Guild).members.cache.find((m) => m.id === authorId)
      ?.roles.cache;
    if (!roles) return false;

    let all: SpecifiedPermsStatus = {};
    for (let [roleId] of roles) {
      const result = await this.roleHasPermissions(
        guildId,
        roleId,
        permissionNames
      );
      all = {
        ...all,
        // Filtering to only true and collecting all entries in one object
        ...Object.entries(result).reduce<SpecifiedPermsStatus>(
          (prev, [perm, status]) => ({
            ...prev,
            ...(status ? { [perm]: status } : {}),
          }),
          {}
        ),
      };
      if (Object.entries(all).every(([permission, status]) => status))
        return true;
    }

    return false;
  }

  async roleHasPermissions(
    guildId: Snowflake,
    roleId: Snowflake,
    permissionNames: PermissionName[]
  ): Promise<SpecifiedPermsStatus> {
    const targetPermissions = (
      await this._permissionService.getRoleAll(guildId, roleId)
    ).map((t) => t.permissionName);
    return permissionNames.reduce<SpecifiedPermsStatus>(
      (prev, cur) => ({
        ...prev,
        ...{ [cur]: targetPermissions.includes(cur) },
      }),
      {}
    );
  }

  async removePermissions(
    guildId: Snowflake,
    roleId: Snowflake,
    permissions: PermissionName[]
  ) {
    try {
      const toRemove = (
        await this._permissionService.getRoleAll(guildId, roleId)
      ).filter((instance) => permissions.includes(instance.permissionName));

      await this._permissionService.delete(...toRemove);
    } catch (e) {
      LoggerFactory.get(PermissionsManager).error(e);
    }
  }

  async addPermissions(
    guildId: Snowflake,
    roleId: Snowflake,
    permissions: PermissionName[]
  ) {
    try {
      await this._permissionService.create(
        ...permissions.map((permissionName) => ({
          guildId,
          roleId,
          permissionName,
        }))
      );
    } catch (e) {
      LoggerFactory.get(PermissionsManager).error(e);
    }
  }
}
