import { FlowProducer, Queue, Worker } from "bullmq";

import { config } from "#config";

import {
  BullMQCommonConfig,
  BullMQNamespace,
  BullMQQueueConfig,
  DbLogQueue,
} from "#enum/bullmq.enum.ts";
import { HttpError } from "#error/http-error.ts";
import { db as logDb, sql } from "#lib/kysely/log.ts";
import { BullMQQueueInstance } from "#lib/redis/queue.ts";
import { BullMQWorkerInstance } from "#lib/redis/worker.ts";
import { globalLogger } from "#logger";
import type { TableData } from "#types/database.js";
import type {
  BullDbLogStatisticsJobData,
  BullDbLogStatisticsJobEventName,
  BullDbLogStatisticsJobType,
} from "#types/service/job.d.ts";
import ResponseUtil from "#utils/response.util.ts";

const logger = globalLogger.child({ fileFlag: "service/job/statistic" });

/**
 * @Description: DB日志记录相关
 * @Date: 2025/9/9 13:57
 */
const queue = new Queue<BullDbLogStatisticsJobData, ResponseUtil, BullDbLogStatisticsJobEventName>(
  BullMQNamespace.DB_LOG,
  {
    connection: BullMQQueueInstance,
    defaultJobOptions: {
      ...BullMQCommonConfig,
      ...BullMQQueueConfig,
    },
  },
).on("error", (err) => {
  logger.error(err);
});

const worker = new Worker<
  BullDbLogStatisticsJobData,
  ResponseUtil,
  BullDbLogStatisticsJobEventName
>(
  BullMQNamespace.DB_LOG,
  async (job) => {
    await DbLogConsumer.execute(job);
    return ResponseUtil.success(null, "ok");
  },
  {
    ...BullMQCommonConfig,
    connection: BullMQWorkerInstance,
    autorun: config.bullMQ.BULLMQ_DB_LOG_START,
  },
)
  .on("active", (job) => {
    logger.info(`${BullMQNamespace.DB_LOG} worker is active | task=${job.name} | jobID=${job.id}`);
  })
  .on("stalled", (jobId) => {
    logger.warn(`${BullMQNamespace.DB_LOG} worker is stalled | jobID=${jobId}`);
  })
  .on("completed", (job) => {
    const spend = job.finishedOn! - job.processedOn!;
    logger.info(
      `${BullMQNamespace.DB_LOG} worker is competed | task=${job.name} | jobID=${job.id} | spend=${spend}ms`,
    );
  })
  .on("failed", (job) => {
    logger.error(`${BullMQNamespace.DB_LOG} worker failed | failReason=${job?.failedReason}`);
    logger.error(job?.stacktrace);
  })
  .on("error", (failedReason) => {
    logger.error(`${BullMQNamespace.DB_LOG} worker error | error=%s`, failedReason);
  });

const flowProducer = new FlowProducer({ connection: BullMQWorkerInstance });

// 统计消费者
class DbLogConsumer {
  private readonly job: BullDbLogStatisticsJobType;
  constructor(job: BullDbLogStatisticsJobType) {
    this.job = job;
  }
  static async execute(job: BullDbLogStatisticsJobType) {
    const instance = new DbLogConsumer(job);
    return instance.main();
  }
  async main() {
    const { name } = this.job;
    if (name === DbLogQueue.Divide) {
      return await this.apiLogTableHandler();
    }
    throw HttpError.throwServerError("not match any job name, pls check your code");
  }

  /**
   * api日志表统计与创建（当到达几千条后，再进行命中任何索引的查询，都会异常耗时）
   */
  async apiLogTableHandler() {
    const tables = await logDb.introspection.getTables();
    const mainTable = tables.toSorted((curr, next) => next.name.localeCompare(curr.name))[0];
    const mainTableName = mainTable.name;
    const [tableName, num] = mainTableName.split("_");
    const { rows } = await logDb.executeQuery<TableData>(
      sql`SHOW TABLE STATUS LIKE ${mainTableName}`.compile(logDb),
    );
    const { Rows } = rows[0];
    // ⚠️ 暂时写死为1500万行开始水平分表，实际上这个值应该是计算得出的，当B+树超过3层时就应该水平分表了
    if (Rows < 15_000_000) return;

    const newMainTableName = `${tableName}_${Number.parseInt(num) + 1}`;
    await logDb.schema
      .createTable(newMainTableName)
      .addColumn("id", "integer", (col) => col.primaryKey().autoIncrement().notNull())
      .addColumn("account_id", "integer", (col) => col.defaultTo(0).notNull())
      .addColumn("teacher_id", "integer", (col) => col.defaultTo(0).notNull())
      .addColumn("student_id", "integer", (col) => col.defaultTo(0).notNull())
      .addColumn("method", "varchar(10)", (col) => col.notNull().modifyEnd(sql`comment '请求方法'`))
      .addColumn("url", "varchar(2048)", (col) => col.notNull().modifyEnd(sql`comment '请求路径'`))
      .addColumn("ip", "varchar(39)", (col) =>
        col.notNull().modifyEnd(sql`comment 'ipv4/ipv6 定义为varchar为了方便直接看库'`),
      )
      .addColumn("request_body", "json", (col) =>
        col.notNull().modifyEnd(sql`comment '用户请求体'`),
      )
      .addColumn("user_payload", "json", (col) =>
        col.notNull().modifyEnd(sql`comment '用户详细数据'`),
      )
      .addColumn("agent", "varchar(255)", (col) => col.notNull())
      .addColumn("create_time", "timestamp", (col) =>
        col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
      )
      .addColumn("update_time", "timestamp", (col) =>
        col
          .notNull()
          .defaultTo(sql`CURRENT_TIMESTAMP`)
          .modifyEnd(sql`on update CURRENT_TIMESTAMP`),
      )
      .execute();
    await Promise.all([
      logDb.schema.createIndex("account_idx").on(newMainTableName).column("account_id").execute(),
      logDb.schema.createIndex("teacher_idx").on(newMainTableName).column("teacher_id").execute(),
      logDb.schema.createIndex("student_idx").on(newMainTableName).column("student_id").execute(),
      logDb.schema
        .createIndex("url_idx")
        .on(newMainTableName)
        .expression(sql`url(100), method`)
        .execute(),
      logDb.schema.createIndex("ip_idx").on(newMainTableName).column("ip").execute(),
      logDb.schema
        .createIndex("create_time_idx")
        .on(newMainTableName)
        .column("create_time")
        .execute(),
    ]);
    logger.info(`${DbLogQueue.Divide} create new table success`);
  }
}

export { queue, flowProducer, worker };
