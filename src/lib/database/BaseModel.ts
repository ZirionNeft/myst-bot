import { Model, ModelCtor, Sequelize, FindOptions } from "sequelize";

export interface IModelAttributes {
	[key: string]: any;
}

/**
 * Abstract class to be extended by models
 * declares the default structure of a model
 * */
export abstract class BaseModel<
	TModelAttributes extends IModelAttributes = any,
	TCreationAttributes extends IModelAttributes = TModelAttributes
> extends Model<TModelAttributes, TCreationAttributes> {
	public static readonly ModelName: string;
	public static readonly ModelNamePlural: string;
	public static readonly TableName: string;
	public static readonly DefaultScope: FindOptions = {};

	/**
	 * Method to initialize the model
	 * */
	public static prepareInit(_sequelize: Sequelize) {
		throw new Error("prepareInit not implemented");
	}

	public static setHooks(_modelCtors: {
		[modelName: string]: ModelCtor<BaseModel>;
	}) {
		throw new Error("setHooks not implemented");
	}

	/**
	 * Method to set all needed associations for the model
	 **/
	public static setAssociations(_modelCtors: {
		[modelName: string]: ModelCtor<BaseModel>;
	}) {
		throw new Error("setAssociations not implemented");
	}
}
