import { BulkCreateOptions, DataTypes, Optional, Sequelize } from "sequelize";
import type { Snowflake } from "discord.js";
import { BaseModel, IModelAttributes } from "../BaseModel";

export interface EmojiAttributes extends IModelAttributes {
	id: number;
	name: string;
	guildId: Snowflake;
	emojiId: Snowflake;
	counter: number;
}

export interface EmojiCreationAttributes
	extends Optional<EmojiAttributes, "id" | "name" | "counter"> {}

export class EmojiModel extends BaseModel<
	EmojiAttributes,
	EmojiCreationAttributes
> {
	public id!: number;
	public name!: string;
	public emojiId!: Snowflake;
	public guildId!: Snowflake;
	public counter!: number;

	public readonly createdAt!: Date;
	public readonly updatedAt!: Date;

	public static readonly ModelName: string = "Emoji";
	public static readonly ModelNamePlural: string = "Emojis";
	public static readonly TableName: string = "emojis";

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
				name: {
					singular: this.ModelName,
					plural: this.ModelNamePlural,
				},
				sequelize,
			}
		);
	}

	public static setHooks() {
		this.addHook(
			"afterBulkCreate",
			(
				emojis,
				options: {
					rawInstances?: {
						emojiId: Snowflake;
						counter: number;
					}[];
				} & BulkCreateOptions<EmojiAttributes>
			) => {
				for (const emojiInstance of emojis) {
					const rawEmoji = options.rawInstances?.find(
						(e) => emojiInstance.get().emojiId === e.emojiId
					);
					if (!rawEmoji) continue;
					void emojiInstance.increment("counter", {
						by: rawEmoji.counter,
					});
				}
			}
		);
	}
}
