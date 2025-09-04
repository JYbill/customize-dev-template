import { CamelCasePlugin, type Compilable, Kysely, MysqlDialect, sql } from "kysely";
import { type PoolOptions, createPool } from "mysql2";
import { format } from "sql-formatter";

import { config } from "#config";

import { globalLogger } from "#logger";
import type { DB } from "#types/database.d.ts";

const logger = globalLogger.child({ fileFlag: "lib/kysely/log" });

const mysqlConfig = { ...config.mysql.log } as PoolOptions;

const dialect = new MysqlDialect({
  pool: createPool(mysqlConfig),
});

const db = new Kysely<DB>({
  dialect,
  plugins: [new CamelCasePlugin()],
});

/**
 * DEBUG调试SQL语句
 * @param debug
 */
const debugSQL = (debug = false) => {
  return <T extends Compilable>(db: T) => {
    const params = db.compile().parameters.map(String);
    if (debug) {
      logger.info(
        "DEBUG Raw SQL\n%s",
        format(db.compile().sql, {
          language: "mysql",
          tabWidth: 2,
          keywordCase: "upper",
          linesBetweenQueries: 2,
          params,
        }),
      );
    }
    return db;
  };
};
export { sql, debugSQL, db };
export * from "kysely";
export * from "kysely/helpers/mysql";
