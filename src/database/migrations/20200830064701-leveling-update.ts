import { QueryInterface, DataTypes } from "sequelize";
import { UserModel } from "../models";

export async function up(query: QueryInterface) {
  try {
    //return query.addColumn(UserModel.tableName, {});
  } catch (e) {
    return Promise.reject(e);
  }
}

export async function down(query: QueryInterface) {
  try {
    //return
  } catch (e) {
    return Promise.reject(e);
  }
}
