import { Model, Optional } from "sequelize";

interface EconomyAttributes {
  id: number;
  memberSnowflake: string;
  coins: number;
  date: Date;
  rouletteDate: Date;
  lootboxDate: Date;
}

interface EconomyCreationAttributes extends Optional<EconomyAttributes, "id"> {}

export default class Economy
  extends Model<EconomyAttributes, EconomyCreationAttributes>
  implements EconomyAttributes {
  coins!: number;
  date!: Date;
  id!: number;
  lootboxDate!: Date;
  memberSnowflake!: string;
  rouletteDate!: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}
