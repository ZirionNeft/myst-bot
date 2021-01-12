import { QueryInterface, DataTypes } from "sequelize";
import { GuildModel, SettingModel } from "../models";

export async function up(query: QueryInterface) {
	try {
		return query.sequelize.transaction((transaction) =>
			Promise.all([
				query.createTable(
					SettingModel.tableName,
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
						name: {
							type: new DataTypes.STRING(32),
							allowNull: false,
						},
						value: {
							type: new DataTypes.STRING(32),
							allowNull: true,
							defaultValue: null,
						},
						createdAt: {
							allowNull: false,
							type: new DataTypes.DATE(),
						},
						updatedAt: {
							allowNull: false,
							type: new DataTypes.DATE(),
						},
					},
					{ transaction }
				),
			])
		);
	} catch (e) {
		return Promise.reject(e.errors);
	}
}

export async function down(query: QueryInterface) {
	try {
		return query.sequelize.transaction((transaction) =>
			Promise.all([
				query.dropTable(SettingModel.tableName, { transaction }),
			])
		);
	} catch (e) {
		return Promise.reject(e);
	}
}
