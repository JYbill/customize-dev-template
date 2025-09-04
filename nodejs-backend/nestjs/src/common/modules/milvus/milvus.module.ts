import { MilvusClient } from "@zilliz/milvus2-sdk-node";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export const MILVUS = Symbol("milvus");

@Module({
  providers: [
    {
      provide: MILVUS,
      useFactory: (configService: ConfigService<IEnv>) => {
        const milvusURL = configService.getOrThrow("MILVUS_URL");
        return new MilvusClient({ address: milvusURL });
      },
      inject: [ConfigService],
    },
  ],
  exports: [MILVUS],
})
export class MilvusModule {}

export type MilvusClientType = MilvusClient;
export type KnowledgeRawData = {
  id: number;
  embedding: number[];
  content: string;
  curriculumId: string;
  courseId: string;
};
