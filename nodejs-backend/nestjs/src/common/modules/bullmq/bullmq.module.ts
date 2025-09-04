import { BullModule } from "@nestjs/bullmq";
import { BullQueue } from "@/common/enum/bullmq.enum";
import { Module } from "@nestjs/common";
import { REDIS_CONFIG, RedisModule } from "@/common/modules/redis/redis.module";
import { type RedisOptions } from "bullmq";

const ragQueue = BullModule.registerQueue({
  name: BullQueue.EXECUTOR,
});
const whisperQueue = BullModule.registerQueueAsync({
  imports: [RedisModule],
  name: BullQueue.WHISPER, // 注册 WHISPER 队列
  useFactory: (redisConnection: RedisOptions) => ({
    connection: redisConnection,
    prefix: "bull",
  }),
  inject: [REDIS_CONFIG],
});

@Module({
  imports: [ragQueue, whisperQueue],
  exports: [ragQueue, whisperQueue],
})
export class BullmqModule {}
