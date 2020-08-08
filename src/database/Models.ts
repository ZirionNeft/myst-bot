import { Sequelize, DataTypes } from "sequelize";
import Guild from "./models/Guild";
import User from "./models/User";

export abstract class Models {
  // Initialising of tables from models and sync them when app is starting up
  public static init(sequelize: Sequelize) {
    return Promise.all([
      this._usersTableInit(sequelize),
      this._guildsTableInit(sequelize),
    ]);
  }

  private static _usersTableInit(sequelize: Sequelize): Promise<User> {
    // User table fields
    User.init(
      {
        id: {
          type: DataTypes.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        guildId: {
          type: new DataTypes.STRING(32),
          allowNull: false,
        },
        userId: {
          type: new DataTypes.STRING(32),
          allowNull: false,
        },
        coins: {
          type: new DataTypes.INTEGER(),
          allowNull: false,
          defaultValue: 0,
        },
        rouletteDate: {
          type: new DataTypes.DATE(),
          defaultValue: null,
        },
      },
      {
        tableName: "users",
        sequelize,
      }
    );

    return User.sync();
  }

  private static _guildsTableInit(sequelize: Sequelize): Promise<Guild> {
    Guild.init(
      {
        id: {
          type: DataTypes.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        guildId: {
          type: new DataTypes.STRING(32),
          allowNull: false,
          unique: true,
        },
        prefix: {
          type: new DataTypes.STRING(16),
          defaultValue: null,
        },
      },
      {
        tableName: "guilds",
        sequelize,
      }
    );

    Guild.hasMany(User, {
      sourceKey: "guildId",
      foreignKey: {
        name: "guildId",
        allowNull: false,
      },
      as: "users",
    });

    return Guild.sync();
  }
}
