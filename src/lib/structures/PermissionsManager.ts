import { Inject, OnlyInstantiableByContainer, Singleton } from "typescript-ioc";
import PermissionService from "../services/PermissionService";
import { Guild, Snowflake, User } from "discord.js";
import LoggerFactory from "../utils/LoggerFactory";

type SpecifiedPermsStatus = { [K in Partial<PermissionName>]?: boolean };

export type PermissionName = "ChangeSettings";

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

    const roles = (guild as Guild).members.cache
      .find((m) => m.id === authorId)
      ?.roles.cache.filter((role) => role.name !== "@everyone");
    if (!roles?.size) return false;

    let foundRoles: PermissionName[] = [];
    for (let [roleId] of roles) {
      const result = await this.getSamePermissionsFromRole(
        guildId,
        roleId,
        permissionNames
      );
      foundRoles = [...foundRoles, ...result];
    }
    return [...new Set(foundRoles)].length === permissionNames.length;
  }

  async getSamePermissionsFromRole(
    guildId: Snowflake,
    roleId: Snowflake,
    permissionNames: PermissionName[]
  ): Promise<PermissionName[]> {
    const rolePermissions = (
      await this._permissionService.getRoleAll(guildId, roleId)
    ).map((t) => t.permissionName);

    return rolePermissions.filter((roleName) =>
      permissionNames.includes(roleName)
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
