import { DataTypes, QueryInterface } from "sequelize";
import { GuildModel } from "../models";
import PermissionModel from "../models/Permission.model";

export async function up(query: QueryInterface) {
  try {
    return query.sequelize.transaction((transaction) =>
      Promise.all([
        query.createTable(
          PermissionModel.tableName,
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
      Promise.all([query.dropTable(PermissionModel.tableName, { transaction })])
    );
  } catch (e) {
    return Promise.reject(e);
  }
}
