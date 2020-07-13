import { Sequelize } from "sequelize";
import * as process from "process";
import * as console from "console";

export abstract class Database {
  public static async init(): Promise<Sequelize> {
    try {
      this._dbInstance = new Sequelize({
        dialect: "sqlite",
        logging: process.env.DEBUG === "true" ? console.log : false,
        storage: "database.sqlite",
      });
      return Promise.resolve(this._dbInstance);
    } catch (e) {
      console.error(e);
      return Promise.reject(e);
    }
  }

  static get instance(): Sequelize {
    return this._dbInstance;
  }

  private static _dbInstance: Sequelize;
}
