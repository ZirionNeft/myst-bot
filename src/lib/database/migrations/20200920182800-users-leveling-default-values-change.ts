import { QueryInterface, DataTypes } from "sequelize";
import { UserModel } from "../models";

export async function up(query: QueryInterface) {
	try {
		return query.sequelize.transaction((transaction) =>
			Promise.all([
				query.changeColumn(
					UserModel.tableName,
					"level",
					{
						type: new DataTypes.INTEGER().UNSIGNED,
						defaultValue: 1,
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
				query.changeColumn(
					UserModel.tableName,
					"level",
					{
						type: new DataTypes.INTEGER().UNSIGNED,
						defaultValue: 0,
					},
					{ transaction }
				),
			])
		);
	} catch (e) {
		return Promise.reject(e);
	}
}
