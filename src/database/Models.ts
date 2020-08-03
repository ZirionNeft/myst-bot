import Economy from "./models/economy";
import { Sequelize, DataTypes } from "sequelize";

export abstract class Models {
  // Initialising of tables from models and sync them when app is starting up
  public static init(sequelize: Sequelize) {
    return Promise.all([this._economyTableInit(sequelize)]);
  }

  private static _economyTableInit(sequelize: Sequelize): Promise<Economy> {
    // Economy table fields
    Economy.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        memberSnowflake: {
          type: new DataTypes.STRING(32),
          allowNull: false,
          unique: true,
        },
        coins: {
          type: new DataTypes.INTEGER(),
          allowNull: false,
          defaultValue: 0,
        },
        date: {
          type: new DataTypes.DATE(),
          defaultValue: new Date(),
        },
        rouletteDate: {
          type: new DataTypes.DATE(),
          defaultValue: null,
        },
        lootboxDate: {
          type: new DataTypes.DATE(),
          defaultValue: null,
        },
      },
      {
        tableName: "economy",
        sequelize,
      }
    );

    return Economy.sync();
  }
}
