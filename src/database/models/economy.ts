import { Model, Optional } from "sequelize";

interface EconomyAttributes {
  id: number;
  memberSnowflake: string;
  coins?: number;
  date?: Date | null;
  rouletteDate?: Date | null;
  lootboxDate?: Date | null;
}

export interface EconomyCreationAttributes
  extends Optional<EconomyAttributes, "id" | "memberSnowflake"> {}

export default class Economy
  extends Model<EconomyAttributes, EconomyCreationAttributes>
  implements EconomyAttributes {
  coins!: number;
  date!: Date | null;
  id!: number;
  lootboxDate!: Date | null;
  memberSnowflake!: string;
  rouletteDate!: Date | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}
