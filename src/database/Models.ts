import { BulkCreateOptions, DataTypes, Sequelize } from "sequelize";
import Guild from "./models/Guild";
import User from "./models/User";
import Emoji, {
  EmojiAttributes,
  EmojiCreationAttributes,
} from "./models/Emoji";
import Logger from "../utils/Logger";

export abstract class Models {
  private static _logger = Logger.get(Models);

  // Initialising of tables from models and sync them when app is starting up
  public static init(sequelize: Sequelize) {
    return Promise.all([
      this._usersTableInit(sequelize),
      this._guildsTableInit(sequelize),
      this._emojiTableInit(sequelize),
    ]);
  }

  private static _emojiTableInit(sequelize: Sequelize): Promise<Emoji> {
    Emoji.init(
      {
        id: {
          type: new DataTypes.INTEGER(),
          autoIncrement: true,
          primaryKey: true,
        },
        guildId: {
          type: new DataTypes.STRING(32),
          allowNull: false,
          unique: "compositeIndex",
        },
        emojiId: {
          type: new DataTypes.STRING(32),
          allowNull: false,
          unique: "compositeIndex",
        },
        name: {
          type: new DataTypes.STRING(32),
        },
        counter: {
          type: new DataTypes.INTEGER(),
          allowNull: false,
          defaultValue: 0,
        },
      },
      {
        scopes: {
          guild(id) {
            return {
              where: {
                guildId: id,
              },
            };
          },
          emoji(id) {
            return {
              where: {
                emojiId: id,
              },
            };
          },
        },
        tableName: "emojis",
        sequelize,
      }
    );

    Emoji.addHook(
      "afterBulkCreate",
      (
        emojis,
        options: {
          rawInstances?: EmojiCreationAttributes[];
        } & BulkCreateOptions<EmojiAttributes>
      ) => {
        try {
          for (let emojiInstance of emojis) {
            const rawEmoji = options.rawInstances?.find(
              (e) => emojiInstance.get().emojiId === e.emojiId
            );
            if (!rawEmoji) continue;
            emojiInstance
              .increment("counter", {
                by: rawEmoji.counter,
              })
              .then();
          }
        } catch (e) {
          if (process.env.DEBUG) Models._logger.error(e);
          else
            Models._logger.error(
              `Emoji incrementing error! More info available in debug mode`
            );
        }
      }
    );

    return Emoji.sync();
  }

  private static _usersTableInit(sequelize: Sequelize): Promise<User> {
    User.init(
      {
        id: {
          type: new DataTypes.INTEGER(),
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
          type: new DataTypes.INTEGER(),
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

    Guild.addHook("afterCreate", (guild) =>
      Models._logger.info(
        `New Guild added in Database: <%s>`,
        guild.get().guildId
      )
    );

    return Guild.sync();
  }
}
