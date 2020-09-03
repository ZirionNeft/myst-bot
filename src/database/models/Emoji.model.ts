import {
  BulkCreateOptions,
  DataTypes,
  ModelCtor,
  Optional,
  Sequelize,
} from "sequelize";
import { Snowflake } from "discord.js";
import Logger from "../../utils/Logger";
import { BaseModel } from "../BaseModel";
import { config } from "node-config-ts";

export interface EmojiAttributes {
  id: number;
  name: string;
  guildId: Snowflake;
  emojiId: Snowflake;
  counter: number;
}

export interface EmojiCreationAttributes
  extends Optional<EmojiAttributes, "id" | "name" | "counter"> {}

export default class EmojiModel
  extends BaseModel<EmojiAttributes, EmojiCreationAttributes>
  implements EmojiAttributes {
  public static readonly ModelName: string = "Emoji";
  public static readonly ModelNamePlural: string = "Emojis";
  public static readonly TableName: string = "emojis";

  private static _logger = Logger.get(EmojiModel);

  id!: number;
  name!: string;
  emojiId!: Snowflake;
  guildId!: Snowflake;
  counter!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static prepareInit(sequelize: Sequelize): void {
    this.init(
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
        tableName: this.TableName,
        sequelize,
      }
    );
  }

  public static setHooks(modelCtors: {
    [modelName: string]: ModelCtor<BaseModel>;
  }) {
    this.addHook(
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
          if (config.general.debug) this._logger.error(e);
          else
            this._logger.error(
              `Emoji incrementing error! More info available in debug mode`
            );
        }
      }
    );
  }

  public static setAssociations(modelCtors: {
    [modelName: string]: ModelCtor<BaseModel>;
  }) {}
}
