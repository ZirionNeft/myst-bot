import { QueryInterface, DataTypes } from "sequelize";
import { UserModel } from "../models";

export async function up(query: QueryInterface) {
	try {
		return query.sequelize.transaction((transaction) =>
			Promise.all([
				query.addColumn(
					UserModel.tableName,
					"level",
					{
						type: new DataTypes.INTEGER().UNSIGNED,
						defaultValue: 0,
					},
					{ transaction }
				),
				query.addColumn(
					UserModel.tableName,
					"experience",
					{
						type: new DataTypes.INTEGER().UNSIGNED,
						defaultValue: 0,
					},
					{ transaction }
				),
				query.addConstraint(UserModel.tableName, {
					fields: ["guildId", "userId"],
					type: "unique",
					name: "compositeIndex",
					transaction,
				}),
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
				query.removeColumn(UserModel.tableName, "level", {
					transaction,
				}),
				query.removeColumn(UserModel.tableName, "experience", {
					transaction,
				}),
				query.removeConstraint(UserModel.tableName, "compositeIndex", {
					transaction,
				}),
			])
		);
	} catch (e) {
		return Promise.reject(e);
	}
}
