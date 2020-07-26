import COINS from "../js_old/json/coins.json";
import Economy from "./database/models/economy";
import { Snowflake } from "discord.js";
import * as console from "console";

export const tempCoins = (): boolean => {
  const tempArr: Promise<Economy>[] = [];
  const entries: [Snowflake, Economy][] = Object.entries(COINS);
  for (const [snow, v] of entries) {
    tempArr.push(
      Economy.create({
        memberSnowflake: snow,
        date: v.date ? new Date(v.date) : null,
        coins: v.coins,
        rouletteDate: v.rouletteDate ? new Date(v.rouletteDate) : null,
        lootboxDate: v.lootboxDate ? new Date(v.lootboxDate) : null,
      })
    );
  }

  try {
    Promise.all(tempArr).catch((e) => console.error(e));
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};

// {
//    "159839961850445824":{
//    "coins":5,
//       "date":1580480287701,
//       "rouletteDate":"2020-04-30T05:44:57.952Z",
//       "lootboxDate":"2020-04-30T05:44:39.296Z"
//    },
// }
