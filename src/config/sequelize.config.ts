/**
 * This file is only here to collect all database environments and give them back
 * for the migration process of the sequelize-cli
 */

import { config } from "node-config-ts";
import { sequelizeLogging } from "../lib/database/Database";
import { bindEnvVars } from "../Myst";

bindEnvVars(config);

module.exports = {
	development: { ...config.database, logging: sequelizeLogging },
	production: { ...config.database, logging: sequelizeLogging },
};
