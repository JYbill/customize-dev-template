import ms from "ms";
import type { PoolOptions } from "mysql2";
import mysql, {
  type PoolConnection,
  type QueryOptions,
  type ResultSetHeader,
  type RowDataPacket,
} from "mysql2/promise";

import { config } from "#app/config/index.ts";
import { HttpError } from "#error/http-error.ts";
import { globalLogger } from "#logger";
import type { MySql2Rollback, MySql2Tx, SqlParms } from "#types/library.d.ts";
import { pingCallback } from "#utils/app.util.ts";
import { camelCase } from "#utils/lodash.util.ts";

const mysqlConfig = { ...config.mysql.wzj } as PoolOptions;
let pool = mysql.createPool(mysqlConfig);
let poolTransaction = mysql.createPool(mysqlConfig);
const logger = globalLogger.child({ fileFlag: "database" });

const query = async (
  sql: string,
  params?: SqlParms,
  opts?: Omit<QueryOptions, "sql" | "values">,
) => {
  let connection: PoolConnection | null = null;
  try {
    connection = await pool.getConnection();
    const [rows, _fields] = await connection.query<RowDataPacket[]>({
      sql,
      values: params,
      ...opts,
    });
    return rows;
  } catch (error) {
    console.error(sql, params);
    console.error(error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

const edit = async (sql: string, params: SqlParms) => {
  let connection: mysql.PoolConnection | null = null;
  try {
    connection = await pool.getConnection();
    const [data, _fields] = await connection.query<ResultSetHeader>(sql, params);
    connection.release();
    return data.affectedRows;
  } catch (error) {
    console.error(sql, params);
    console.error(error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

const add = async (sql: string, params: SqlParms) => {
  let connection: mysql.PoolConnection | null = null;
  try {
    connection = await pool.getConnection();
    const [data, _fields] = await connection.query<ResultSetHeader>(sql, params);
    connection.release();
    return data.insertId;
  } catch (error) {
    console.error(sql, params);
    console.error(error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

const queryOne = async (
  sql: string,
  params?: SqlParms,
  opts?: Omit<QueryOptions, "sql" | "values">,
) => {
  let connection: mysql.PoolConnection | null = null;
  try {
    connection = await pool.getConnection();
    const [rows, _fields] = await connection.query<RowDataPacket[]>({
      sql,
      values: params,
      ...opts,
    });
    connection.release();
    return rows[0];
  } catch (error) {
    console.error(sql, params);
    console.error(error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

const commit = async (connection: mysql.PoolConnection) => {
  try {
    await connection.query("COMMIT");
    // await connection.query('SET AUTOCOMMIT=1');
  } catch (error) {
    // await connection.query('SET AUTOCOMMIT=1');
    console.error("rollback ", error);
    await connection.query("ROLLBACK");
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

const transaction = async <T>(
  fn: (queryFn: MySql2Tx, rollbackFn: MySql2Rollback) => Promise<T>,
): Promise<T> => {
  const connection = await poolTransaction.getConnection();

  await connection.query("START TRANSACTION");
  await connection.query("SET AUTOCOMMIT=0");
  let needRollback = false;
  const rollback: MySql2Rollback = async (abort = false) => {
    needRollback = true;
    await connection.query("ROLLBACK");
    // await connection.query('SET AUTOCOMMIT=1');
    if (abort) {
      throw HttpError.throwServerError("mysql error");
    }
  };

  const queryFn: MySql2Tx = async (sql: string, params?: SqlParms) => {
    try {
      const [data, _fields] = await connection.query(sql, params);
      if ((data as ResultSetHeader).insertId >= 0) {
        return (data as ResultSetHeader).insertId;
      } else {
        return data;
      }
      // 历史遗留总是，暂时先这样返回数据
      // return (data as ResultSetHeader).insertId ? data.insertId : data;
    } catch (error) {
      console.error(error);
      console.error(sql);
      await rollback(true);
    }
  };

  const result = await fn(queryFn, rollback);
  if (!needRollback) {
    await commit(connection);
  } else {
    connection.release();
  }
  return result;
};

const escapeLikeStr = (str: string) => {
  return `%${str.replace(/%/g, "\\%")}%`;
};

const checkConnection = async () => {
  let connection: mysql.PoolConnection | null = null;
  try {
    connection = await pool.getConnection();
    await connection.query(`SELECT 1 + 1`);
  } catch (err: unknown) {
    const error = err as Error;
    console.error(error);
    if (
      error.message === "This socket has been ended by the other party" ||
      error.message === `Can't add new command when connection is in closed state`
    ) {
      pool = mysql.createPool(mysqlConfig);
    }
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

const checkTransactionConnection = async () => {
  let connection: mysql.PoolConnection | null = null;
  try {
    connection = await poolTransaction.getConnection();
    await connection.query(`SELECT 1 + 1`);
  } catch (err: any) {
    const error = err as Error;
    console.error(error);
    if (
      error.message === "This socket has been ended by the other party" ||
      error.message === `Can't add new command when connection is in closed state`
    ) {
      poolTransaction = mysql.createPool(mysqlConfig);
    }
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

pingCallback({
  ms: ms("6h"),
  async callback() {
    logger.info("db socket keepalive running");
    const start = performance.now();
    await Promise.all([checkConnection(), checkTransactionConnection()]);
    logger.info(`db socket keepalive end, spend: ${performance.now() - start}ms`);
  },
});

export { query, queryOne, edit, add, transaction, escapeLikeStr, mysql, camelCase };
