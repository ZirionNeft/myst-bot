import { QueryInterface, DataTypes } from "sequelize";
import { GuildModel } from "../models";

export async function up(query: QueryInterface) {
	try {
		return query.sequelize.transaction((transaction) =>
			Promise.all([
				query.addColumn(
					GuildModel.tableName,
					"staffChannelId",
					{
						type: new DataTypes.STRING(32),
						defaultValue: null,
						allowNull: true,
					},
					{ transaction }
				),
				query.addColumn(
					GuildModel.tableName,
					"infoChannelId",
					{
						type: new DataTypes.STRING(32),
						defaultValue: null,
						allowNull: true,
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
				query.removeColumn(GuildModel.tableName, "infoChannelId", {
					transaction,
				}),
				query.removeColumn(GuildModel.tableName, "staffChannelId", {
					transaction,
				}),
			])
		);
	} catch (e) {
		return Promise.reject(e);
	}
}
