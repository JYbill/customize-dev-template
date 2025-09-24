import { CourseClientEvent } from "#ws/enum/course.ts";

/**
 * @Description: 功能与room.util.ts一致，拼接客户端监听事件
 * @Date: 2025/7/17 18:05
 */
export class ClientEventCalculator {
  /**
   * 老师监听：加入小组事件
   */
  static joinTeam(courseId: number, schemaId: number) {
    return `${CourseClientEvent.JOIN_TEAM}:${courseId}:${schemaId}` as const;
  }
  /**
   * 学生监听：加入小组事件
   */
  static studentJoinTeam(courseId: number, schemaId: number) {
    return `${CourseClientEvent.STUDENT_JOIN_TEAM}:${courseId}:${schemaId}` as const;
  }
}
