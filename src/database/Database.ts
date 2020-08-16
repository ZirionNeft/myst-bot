import { Sequelize } from "sequelize";
import * as process from "process";
import * as console from "console";

export abstract class Database {
  public static async init(): Promise<Sequelize> {
    const dbPass = process.env.DB_PASS;
    const dbUser = process.env.DB_USER;
    const dbDatabase = process.env.DB_DATABASE;
    const dbHost = process.env.DB_HOST;

    try {
      this._dbInstance = new Sequelize(
        `postgres://${dbUser}:${dbPass}@${dbHost}/${dbDatabase}`,
        {
          logging: process.env.DEBUG === "true" ? console.log : false,
        }
      );
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
