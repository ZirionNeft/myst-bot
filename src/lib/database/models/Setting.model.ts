import { DataTypes, Optional, Sequelize } from "sequelize";
import type { Snowflake } from "discord.js";
import { BaseModel, IModelAttributes } from "../BaseModel";
import type { TSettingName } from "../../../commands/Admin/set";
import type { ArgType } from "@sapphire/framework";

export interface SettingAttributes extends IModelAttributes {
	id: number;
	guildId: Snowflake;
	name: TSettingName;
	value: keyof ArgType;
}

export interface SettingCreationAttributes
	extends Optional<SettingAttributes, "id" | "value"> {}

export class SettingModel extends BaseModel<
	SettingAttributes,
	SettingCreationAttributes
> {
	public id!: number;
	public guildId!: Snowflake;
	public name!: TSettingName;
	public value!: keyof ArgType;

	public readonly createdAt!: Date;
	public readonly updatedAt!: Date;

	public static readonly ModelName: string = "Setting";
	public static readonly ModelNamePlural: string = "Settings";
	public static readonly TableName: string = "settings";

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
				},
				name: {
					type: new DataTypes.STRING(32),
					allowNull: false,
				},
				value: {
					type: new DataTypes.STRING(32),
					allowNull: true,
					defaultValue: null,
				},
			},
			{
				tableName: this.TableName,
				name: {
					singular: this.ModelName,
					plural: this.ModelNamePlural,
				},
				scopes: {
					guild(id) {
						return {
							where: {
								guildId: id,
							},
						};
					},
				},
				sequelize,
			}
		);
	}
}
