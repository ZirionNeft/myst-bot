import * as fs from "fs";
import * as path from "path";
import { ModelCtor } from "sequelize/types/lib/model";
import { BaseModel } from "./BaseModel";

export default class Models {
  /**
   * exports all Model classes of files that end with '.model.ts'
   * */
  public static load() {
    const array = this._getFilesRecursively(__dirname)
      .filter((fileName) => fileName.endsWith("model.js"))
      .map((fileName) => {
        // tslint:disable-next-line:non-literal-require
        const modelClass = require(fileName);
        const models = {};
        Object.keys(modelClass).forEach((key) => {
          if (
            modelClass[key].constructor != null &&
            modelClass[key].ModelName != null
          ) {
            models[modelClass[key].ModelName] = modelClass[key];
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

  private static _getAllSubFolders(
    baseFolder: string,
    folderList: string[] = []
  ) {
    const folders: string[] = fs
      .readdirSync(baseFolder)
      .filter((file) => fs.statSync(path.join(baseFolder, file)).isDirectory());
    folders.forEach((folder) => {
      folderList.push(path.join(baseFolder, folder));
      this._getAllSubFolders(path.join(baseFolder, folder), folderList);
    });
    return folderList;
  }

  private static _getFilesInFolder(rootPath: string) {
    return fs
      .readdirSync(rootPath)
      .filter(
        (filePath) => !fs.statSync(path.join(rootPath, filePath)).isDirectory()
      )
      .map((filePath) => path.normalize(path.join(rootPath, filePath)));
  }

  private static _getFilesRecursively(rootPath: string): string[] {
    const rootFiles = this._getFilesInFolder(rootPath);
    const subFolders = this._getAllSubFolders(rootPath);
    const allFiles = subFolders.map(this._getFilesInFolder);
    return ([] as string[]).concat.apply([...rootFiles], allFiles);
  }
}
