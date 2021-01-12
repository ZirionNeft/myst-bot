import { DataTypes, Optional, Sequelize } from "sequelize";
import type { Snowflake } from "discord.js";
import { BaseModel, IModelAttributes } from "../BaseModel";
import { GuildModel } from "./index";
import type { PermissionName } from "../../structures/PermissionsManager";

export interface PermissionAttributes extends IModelAttributes {
	id: number;
	guildId: Snowflake;
	roleId: Snowflake;
	permissionName: PermissionName;
}

export interface PermissionCreationAttributes
	extends Optional<PermissionAttributes, "id"> {}

export class PermissionModel extends BaseModel<
	PermissionAttributes,
	PermissionCreationAttributes
> {
	public id!: number;
	public guildId!: Snowflake;
	public roleId!: Snowflake;
	public permissionName!: PermissionName;

	public readonly createdAt!: Date;
	public readonly updatedAt!: Date;

	public static readonly ModelName: string = "Permission";
	public static readonly ModelNamePlural: string = "Permissions";
	public static readonly TableName: string = "permissions";

	public static prepareInit(sequelize: Sequelize): void {
		this.init(
			{
				id: {
					type: new DataTypes.INTEGER(),
					autoIncrement: true,
					primaryKey: true,
				},
				guildId: {
					type: new DataTypes.STRING(32),
					allowNull: false,
					references: {
						model: GuildModel.TableName,
						key: "guildId",
					},
				},
				roleId: {
					type: new DataTypes.STRING(32),
					allowNull: false,
				},
				permissionName: {
					type: new DataTypes.STRING(),
					allowNull: false,
				},
			},
			{
				tableName: this.TableName,
				name: {
					singular: this.ModelName,
					plural: this.ModelNamePlural,
				},
				scopes: {
					guild(guildId: Snowflake) {
						return {
							where: {
								guildId,
							},
						};
					},
					target(guildId: Snowflake, roleId: Snowflake) {
						return {
							where: {
								guildId,
								roleId,
							},
						};
					},
				},
				sequelize,
			}
		);
	}
}
