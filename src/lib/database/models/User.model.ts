import { DataTypes, Optional, Sequelize } from "sequelize";
import type { Snowflake } from "discord.js";
import { BaseModel, IModelAttributes } from "../BaseModel";

export interface UserAttributes extends IModelAttributes {
	id: number;
	userId: Snowflake;
	guildId: Snowflake;
	coins: number;
	rouletteDate: Date | null;
	experience: number;
	level: number;
}

export interface UserCreationAttributes
	extends Optional<
		UserAttributes,
		"id" | "experience" | "level" | "coins" | "rouletteDate"
	> {}

export class UserModel extends BaseModel<
	UserAttributes,
	UserCreationAttributes
> {
	public id!: number;
	public guildId!: Snowflake;
	public userId!: Snowflake;
	public coins!: number;
	public rouletteDate!: Date | null;
	public experience!: number;
	public level!: number;

	public readonly createdAt!: Date;
	public readonly updatedAt!: Date;

	public static readonly ModelName: string = "User";
	public static readonly ModelNamePlural: string = "Users";
	public static readonly TableName: string = "users";

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
					unique: "compositeIndex",
				},
				userId: {
					type: new DataTypes.STRING(32),
					allowNull: false,
					unique: "compositeIndex",
				},
				coins: {
					type: new DataTypes.INTEGER(),
					allowNull: false,
					defaultValue: 0,
				},
				rouletteDate: {
					type: new DataTypes.DATE(),
					defaultValue: null,
				},
				level: {
					type: new DataTypes.INTEGER().UNSIGNED,
					defaultValue: 1,
				},
				experience: {
					type: new DataTypes.INTEGER().UNSIGNED,
					defaultValue: 0,
				},
			},
			{
				tableName: this.TableName,
				name: {
					singular: this.ModelName,
					plural: this.ModelNamePlural,
				},
				sequelize,
			}
		);
	}
}
