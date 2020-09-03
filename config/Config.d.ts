/* tslint:disable */
/* eslint-disable */
declare module "node-config-ts" {
  interface IConfig {
    bot: Bot;
    general: General;
    database: Database;
  }
  interface Database {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    dialect: string;
    sync: Sync;
    define: Define;
    timezone: string;
  }
  interface Define {
    paranoid: boolean;
    timestamps: boolean;
    underscored: boolean;
    freezeTableName: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt: string;
    charset: string;
    schema: string;
  }
  interface Sync {
    force: boolean;
    logging: boolean;
    alter: boolean;
  }
  interface General {
    debug: boolean;
    loglevel: string;
  }
  interface Bot {}
  export const config: Config;
  export type Config = IConfig;
}
