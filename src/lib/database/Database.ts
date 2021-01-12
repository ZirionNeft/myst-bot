import { Options, Sequelize } from "sequelize";
import LoggerFactory from "../utils/LoggerFactory";
import Models from "./Models";
import process from "process";
import { config } from "node-config-ts";

export type TDatabase = Database;

export const sequelizeLogging = (sql: string, t?: number) =>
	config.general.debug
		? // eslint-disable-next-line @typescript-eslint/no-use-before-define
		  LoggerFactory.get(Database).trace(
				sql,
				typeof t === "number" ? `Elapsed time: ${t}ms` : ""
		  )
		: false;

class Database {
	public readonly _modelConstructors = Models.load();

	private readonly _sequelize: Sequelize;

	public constructor() {
		this._sequelize = new Sequelize({
			...config.database,
			logging: sequelizeLogging,
		} as Options);

		// init every model
		Object.keys(this._modelConstructors).forEach((modelName) => {
			this._modelConstructors[modelName].prepareInit(this._sequelize);
		});

		// call (create) associations for each model
		Object.keys(this._modelConstructors).forEach((modelName) => {
			this._modelConstructors[modelName].setAssociations(
				this._modelConstructors
			);
		});

		// create hooks for each model
		Object.keys(this._modelConstructors).forEach((modelName) => {
			this._modelConstructors[modelName].setHooks(
				this._modelConstructors
			);
		});
	}

	public async prepare() {
		try {
			// return await to catch error if thrown
			return await this._sequelize.authenticate();
			// do not sync otherwise current data in database will be emptied out (Dropping all tables and recreating them)
			// return await this._sequelize.sync();
		} catch (e) {
			LoggerFactory.get(Database).fatal(e);
			process.exit(1);
		}
	}

	public get sequelize(): Sequelize {
		return this._sequelize;
	}
}

export const getDatabase = async () => {
	const database = new Database();
	await database.prepare();

	return database;
};
