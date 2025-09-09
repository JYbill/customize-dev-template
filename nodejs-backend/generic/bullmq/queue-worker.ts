import { FlowProducer, Queue, Worker } from "bullmq";

import { config } from "#config";

import {
  BullMQCommonConfig,
  BullMQNamespace,
  BullMQQueueConfig,
  StatisticQueue,
} from "#enum/bullmq.enum.ts";
import { HttpError } from "#error/http-error.ts";
import { BullMQQueueInstance } from "#lib/redis/queue.ts";
import { BullMQWorkerInstance } from "#lib/redis/worker.ts";
import { globalLogger } from "#logger";
import type {
  BullStatisticsJobData,
  BullStatisticsJobEventName,
  BullStatisticsJobType,
} from "#types/service/job.d.ts";
import ResponseUtil from "#utils/response.util.ts";

const logger = globalLogger.child({ fileFlag: "service/job/statistic" });

/**
 * @Description: 统计相关
 * @Date: 2025/9/9 13:57
 */
const queue = new Queue<BullStatisticsJobData, ResponseUtil, BullStatisticsJobEventName>(
  BullMQNamespace.STATISTIC,
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

new Worker<BullStatisticsJobData, ResponseUtil, BullStatisticsJobEventName>(
  BullMQNamespace.STATISTIC,
  async (job) => {
    await StatisticsConsumer.execute(job);
    return ResponseUtil.success(null, "ok");
  },
  {
    ...BullMQCommonConfig,
    connection: BullMQWorkerInstance,
    autorun: config.bullMQ.BULLMQ_STATISTIC_START,
  },
)
  .on("active", (job) => {
    logger.info(
      `${BullMQNamespace.STATISTIC} worker is active | task=${job.name} | jobID=${job.id}`,
    );
  })
  .on("stalled", (jobId) => {
    logger.warn(`${BullMQNamespace.STATISTIC} worker is stalled | jobID=${jobId}`);
  })
  .on("completed", (job) => {
    const spend = job.finishedOn! - job.processedOn!;
    logger.info(
      `${BullMQNamespace.STATISTIC} worker is competed | task=${job.name} | jobID=${job.id} | spend=${spend}ms`,
    );
  })
  .on("failed", (job) => {
    logger.error(`${BullMQNamespace.STATISTIC} worker failed | failReason=${job?.failedReason}`);
    logger.error(job?.stacktrace);
  })
  .on("error", (failedReason) => {
    logger.error(`${BullMQNamespace.STATISTIC} worker error | error=%s`, failedReason);
  });

const flowProducer = new FlowProducer({ connection: BullMQWorkerInstance });

// 统计消费者
class StatisticsConsumer {
  private readonly job: BullStatisticsJobType;
  constructor(job: BullStatisticsJobType) {
    this.job = job;
  }
  static async execute(job: BullStatisticsJobType) {
    const instance = new StatisticsConsumer(job);
    return instance.main();
  }
  async main() {
    const { name } = this.job;
    if (name === StatisticQueue.API_LOG_TABLE) {
      return await this.apiLogTableHandler();
    }
    throw HttpError.throwServerError("not match any job name, pls check your code");
  }

  /**
   * api日志表统计与创建（当到达几千条后，再进行命中任何索引的查询，都会异常耗时）
   */
  async apiLogTableHandler() {}
}

export { queue, flowProducer };
