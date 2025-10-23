import { AuthKey } from "#enum/account.enum.ts";
import { RedisKey } from "#enum/redis.enum.ts";
import { RedlockEnum } from "#enum/redlock.enum.ts";

/**
 * 认证授权redis key工具
 */
export class AuthRedisKeyCalculator {
  static retryPassword(account: string) {
    return `${AuthKey.RetryCountKey}:${account}` as const;
  }
}

/**
 * 课堂分组redis key工具
 */
export class CourseTeamRedisKeyCalculator {
  /**
   * 开始分组
   * @param courseId
   * @param schemaId
   */
  static startGroup(courseId: number, schemaId: number) {
    return `${RedisKey.START_GROUP}${courseId}:${schemaId}` as const;
  }

  /**
   * 暗号分组
   * @param courseId
   * @param schemaId
   */
  static cipherTeam(courseId: number, schemaId: number) {
    return `${RedisKey.CIPHER_TEAM}${courseId}:${schemaId}` as const;
  }

  /**
   * 自由分组
   * @param courseId
   * @param schemaId
   */
  static freedomTeam(courseId: number, schemaId: number) {
    return `${RedisKey.FREEDOM_TEAM}${courseId}:${schemaId}` as const;
  }

  /**
   * 分布式锁：老师开启分组
   * @param courseId
   * @param schemaId
   */
  static startGroupLock(courseId: number, schemaId: number) {
    return `${RedlockEnum.START_GROUP}${courseId}:${schemaId}` as const;
  }
}

/**
 * 课程redis key工具
 */
export class CurriculumRedisKeyCalculator {
  /**
   * 迁移单题Hash表缓存
   */
  static migrateQuestion(targetCurriculumId: number) {
    return `${RedisKey.CURRICULUM_MIGRATE_QUESTION}${targetCurriculumId}` as const;
  }

  /**
   * 迁移作业Hash表缓存
   */
  static migrateHomework(targetCurriculumId: number) {
    return `${RedisKey.CURRICULUM_MIGRATE_HOMEWORK}${targetCurriculumId}` as const;
  }

  /**
   * 迁移课件Hash表缓存
   */
  static migrateCourseware(targetCurriculumId: number) {
    return `${RedisKey.CURRICULUM_MIGRATE_COURSEWARE}${targetCurriculumId}` as const;
  }
}
