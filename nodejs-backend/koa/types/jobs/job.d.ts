import type { Job } from "bullmq";

import type {
  AiTeachDesignQueue,
  ApiLogQueue,
  AudioTranscriptionQueue,
  ClipQueue,
  CurriculumMigrateQueue,
  DbLogQueue,
  JobGradeCenterQueue,
  JobHomeworkQueue,
  JobQuestionQueue,
  JobTeamQueue,
  KnowledgeQueue,
  LibraryQueue,
  SPOCChapterQueue,
} from "#enum/bullmq.enum.ts";
import type { FileSource } from "#enum/knowledge.enum.ts";
import type { ResourceType } from "#enum/resource.enum.ts";
import type { StartTeamType, TeamActivityStatus } from "#enum/team.enum.ts";
import type { GetEnumType } from "#types/app.d.ts";
import type { StructuredContentQuery } from "#types/controller/teaching-design.d.ts";
import type { Log } from "#types/log-database.d.ts";
import type { PostClipJobData } from "#types/service/clip.d.ts";
import type { ExtraSetting } from "#types/service/grade-center.d.ts";
import type { BullmqCourseHomeworkData, BullmqHomeworkJobData } from "#types/service/homework.d.ts";
import type { JobQuestionBullmqData } from "#types/service/question.d.ts";
import type ResponseUtil from "#utils/response.util.ts";

/**
 * clip剪辑业务
 */
export type BullClipJobData = PostClipJobData & {
  clipInfoId: number;
};
export type BullClipResult = Record<string, { success: boolean; exception: string | null }>;
export type BullClipJobEventName = GetEnumType<typeof ClipQueue>;
export type BullClipJobType = Job<BullClipJobData, ResponseUtil, BullClipJobEventName>;

/**
 * homework业务类型
 */
export type HomeworkQueuePayload = BullmqHomeworkJobData | BullmqCourseHomeworkData;
export type BullHomeworkJobEventName = GetEnumType<typeof JobHomeworkQueue>;
export type BullHomeworkJobType = Job<HomeworkQueuePayload, ResponseUtil, BullHomeworkJobEventName>;

/**
 * spoc业务类型
 */
export type BullSpocJobEventName = GetEnumType<typeof SPOCChapterQueue>;

/**
 * question业务类型
 */
export type BullQuestionJobEventName = GetEnumType<typeof JobQuestionQueue>;
// bullmq "jobQuestion"队列的job_question对应的类型
export type BullQuestionJobType = Job<
  JobQuestionBullmqData,
  ResponseUtil,
  BullQuestionJobEventName
>;

/**
 * library业务类型
 */
export type BullLibraryJobData = {
  createTime: string;
};
export type BullLibraryJobEventName = GetEnumType<typeof LibraryQueue>;
export type BullLibraryJobType = Job<BullLibraryJobData, ResponseUtil, BullLibraryJobEventName>;

/**
 * team业务类型
 */
export type BullTeamJobData = {
  id: number; // team_activity.id
  courseId: number;
  schemaId: number;
  type: GetEnumType<typeof StartTeamType>;
  status: GetEnumType<typeof TeamActivityStatus>;
  resourceType: GetEnumType<typeof ResourceType>;
  activityId: number;
};
export type BullTeamJobEventName = GetEnumType<typeof JobTeamQueue>;
export type BullTeamJobType = Job<BullTeamJobData, ResponseUtil, BullTeamJobEventName>;

/**
 * grade-center业务类型
 */
export type BullGradeCenterJobData = {
  activityId: number; // 成绩中心活动id
  courseId: number;
  itemId: number;
  weight: string; // 成绩项权重
  type: number; // 除了0为总结资源之外，其他值都来源于`GradeCenterItemType`
  extraSetting: ExtraSetting;
};
export type BullGradeCenterJobEventName = GetEnumType<typeof JobGradeCenterQueue>;
export type BullGradeCenterJobType = Job<
  BullGradeCenterJobData,
  ResponseUtil,
  BullGradeCenterJobEventName
>;

/**
 * ai-knowledge业务类型
 */
export type BullAIKnowledgeJobData = {
  curriculumId: number;
  courseId: number;
  type: GetEnumType<typeof FileSource>;
  fUid: string;
  url: string; // uri
  fileName: string;
  fileExtension: string;
  data:
    | string // m_monitor_speech_recognition.recognition_result json string
    // 未回答出来的问题
    | {
        title: string;
        answer: string;
      };
};
export type BullAIKnowledgeJobEventName = GetEnumType<typeof KnowledgeQueue>;

/**
 * 音频转写完成业务类型
 */
export type BullAudioTranscriptionCompletedJobData = {
  monitorId: number;
};

export type BullAudioTranscriptionCompletedJobEventName = GetEnumType<
  typeof AudioTranscriptionQueue
>;

export type BullAIKnowledgeJobType = Job<
  BullAIKnowledgeJobData,
  ResponseUtil,
  BullAIKnowledgeJobEventName
>;

/**
 * 打压缩包业务类型
 */
export type BullZipTaskJobData<T> = {
  userId: number;
  parms: T;
  type: number;
  taskId: number;
};

/**
 * API日志业务类型
 */
export type BullAPILogJobData = Pick<
  Log,
  "method" | "url" | "ip" | "requestBody" | "userPayload" | "agent"
> & {
  accountId: Log["accountId"] | null;
  teacherId: Log["teacherId"] | null;
  studentId: Log["studentId"] | null;
};
export type BullAPILogJobEventName = GetEnumType<typeof ApiLogQueue>;
export type BullAPILogJobType = Job<BullAPILogJobData, ResponseUtil, BullAPILogJobEventName>;

/**
 * 统计业务类型
 */
export type ApiLogTableJobData = {
  createTime: string;
};
export type BullDbLogStatisticsJobData = ApiLogTableJobData | Record<string, any>;
export type BullDbLogStatisticsJobEventName = GetEnumType<typeof DbLogQueue>;
export type BullDbLogStatisticsJobType = Job<
  BullDbLogStatisticsJobData,
  ResponseUtil,
  BullDbLogStatisticsJobEventName
>;

/**
 * 课程迁移类型
 */
export type BullCurriculumMigrateJobData = {
  accountId: number; // 发起任务的用户id
  teacherId: number; // 发起任务的教师id
  curriculumId: number; // 课程目标id
  targetLibraryId: number; // 课程目标对应的资源库id
  sourceId: number; // 课程源id
  sourceLibraryId: number; // 课程源id对应的资源库id
  activityId: number; // curriculum_migrate_activity.id
  dependencyMigrateTypeList: number[][]; // 依赖层级的课程迁移类型列表（用于排查数据问题）
};
export type BullCurriculumMigrateJobEventName = GetEnumType<typeof CurriculumMigrateQueue>;
export type BullCurriculumMigrateJobType = Job<
  BullCurriculumMigrateJobData,
  ResponseUtil,
  BullCurriculumMigrateJobEventName
>;

/**
 * AI处理教学设计的类型
 */
// ai对教学设计内容进行结构化输出的请求参数
export type StructuredContent = StructuredContentQuery & {
  structuredId: number;
  teacherId: number;
};
export type BullAiTeachDesignJobData = StructuredContent;
export type BullAiTeachDesignJobEventName = GetEnumType<typeof AiTeachDesignQueue>;
export type BullAiTeachDesignJobType = Job<
  BullAiTeachDesignJobData,
  ResponseUtil,
  BullAiTeachDesignJobEventName
>;
