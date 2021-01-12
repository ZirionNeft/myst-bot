import * as fs from "fs";
import * as path from "path";
import type { ModelCtor } from "sequelize/types/lib/model";
import type { BaseModel } from "./BaseModel";

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class Models {
	/**
	 * exports all Model classes of files that end with '.model.ts'
	 * */
	public static load() {
		const array = this.getFilesRecursively(__dirname)
			.filter((fileName) => fileName.endsWith("model.js"))
			.map(async (fileName) => {
				const modelClass = await import(fileName);
				const models: { [key: string]: unknown } = {};
				Object.keys(modelClass).forEach((key) => {
					if (
						modelClass[key].constructor !== null &&
						modelClass[key].ModelName !== null
					) {
						models[modelClass[key].ModelName as string] =
							modelClass[key];
					}
				});
				return models;
			})
			.reduce<{ [key: string]: any }[]>(
				(arr: any[], val: any) => arr.concat(val),
				[]
			);
		let obj = {};
		array.forEach((item) => {
			obj = {
				...obj,
				...item,
			};
		});
		return obj as {
			[modelName: string]: typeof BaseModel & ModelCtor<BaseModel>;
		};
	}

	private static getAllSubFolders(
		baseFolder: string,
		folderList: string[] = []
	) {
		const folders: string[] = fs
			.readdirSync(baseFolder)
			.filter((file) =>
				fs.statSync(path.join(baseFolder, file)).isDirectory()
			);
		folders.forEach((folder) => {
			folderList.push(path.join(baseFolder, folder));
			this.getAllSubFolders(path.join(baseFolder, folder), folderList);
		});
		return folderList;
	}

	private static getFilesInFolder(rootPath: string) {
		return fs
			.readdirSync(rootPath)
			.filter(
				(filePath) =>
					!fs.statSync(path.join(rootPath, filePath)).isDirectory()
			)
			.map((filePath) => path.normalize(path.join(rootPath, filePath)));
	}

	private static getFilesRecursively(rootPath: string): string[] {
		const rootFiles = this.getFilesInFolder(rootPath);
		const subFolders = this.getAllSubFolders(rootPath);
		const allFiles = subFolders.map(this.getFilesInFolder.bind(this));
		return ([] as string[]).concat.apply([...rootFiles], allFiles);
	}
}
