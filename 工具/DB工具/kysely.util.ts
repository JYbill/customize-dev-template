import {
  type Expression,
  type InsertQueryBuilder,
  type InsertResult,
  type OnConflictDatabase,
  type OnConflictTables,
  type UpdateObject,
} from "#db";

export class DBUtil {
  /**
   * 根据 dbInsert...() 在onDuplicateKeyUpdate时对插入的数据设置id，忽略更新的数据
   */
  static setInsertId<T extends { id?: number; [key: string]: any }>(dataList: T[], insertId: number) {
    return dataList.map((item) => ({
      ...item,
      id: isTrusty(item.id) ? item.id : insertId++,
    }));
  }

  /**
   * 插入或更新，兼容mysql、PostgresSQL数据库
   */
  static upsert<Database extends DB, Table extends keyof DB>(
    express: InsertQueryBuilder<Database, Table, InsertResult>,
    mysqlUpdate: UpdateObject<Database, Table>,
    pgUpdate: UpdateObject<OnConflictDatabase<Database, Table>, OnConflictTables<Table>, OnConflictTables<Table>>
  ) {
    return express
      .$if(appConfig.dbType === DBType.Mysql, (eb) => eb.onDuplicateKeyUpdate(mysqlUpdate))
      .$if(appConfig.dbType === DBType.Postgresql, (eb) => eb.onConflict((eb) => eb.constraint("id").doUpdateSet(pgUpdate)));
  }
}
