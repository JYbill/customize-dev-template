import { createOpenAI } from "@ai-sdk/openai";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { EmbeddingModel } from "ai";

export const AI_SDK = Symbol("ai-sdk");

function factoryFunction(config: ConfigService<IEnv>) {
  const OPENAI_AI_BASE_URL = config.getOrThrow("OPENAI_AI_BASE_URL");
  const OPENAI_AI_KEY = config.getOrThrow("OPENAI_API_KEY");
  const model = createOpenAI({
    apiKey: OPENAI_AI_KEY,
    baseURL: OPENAI_AI_BASE_URL,
    compatibility: "strict",
  });
  return {
    embedder: model.embedding("Doubao-embedding"),
  };
}

@Module({
  providers: [
    {
      provide: AI_SDK,
      useFactory: factoryFunction,
      inject: [ConfigService],
    },
  ],
  exports: [AI_SDK],
})
export class AISDKModule {}

export type AISDKType = {
  embedder: EmbeddingModel<string>;
};
