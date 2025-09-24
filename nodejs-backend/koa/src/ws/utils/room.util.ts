export class WSRoomUtilsService {
  /**
   * 服务端发给客户端的事件
   * socket房间号id规则:
   * socket房间号由course + 活动类型 + 课程id组成
   * 例如: course_sign_12345
   */
  static calcCourseJoinId(courseId: number) {
    return `course_join_${courseId}`;
  }
  static calcCourseSignId(courseId: number) {
    return `course_sign_${courseId}`;
  }
  static calcCourseDiscussionId(courseId: number, activityId: number) {
    return `course_discussion_${courseId}_${activityId}`;
  }

  static calcCourseDiscussionIdWithTeam(courseId: number, activityId: number, teamId: number) {
    return `course_discussion_${courseId}_${activityId}_team_${teamId}`;
  }

  static calcCourseDiscussionConfigId(courseId: number, activityId: number) {
    return `course_discussion_config_${courseId}_${activityId}`;
  }

  static calcCourseQuickAnswerId(courseId: number) {
    return `course_quick_answer_${courseId}`;
  }

  static calcTeacherJoinTeamRoom(courseId: number, schemaId: number) {
    return `team_teacher_join_${courseId}_${schemaId}`;
  }

  static calcStudentJoinTeamRoom(courseId: number, schemaId: number) {
    return `team_student_join_${courseId}_${schemaId}`;
  }

  static calcResponderRoom(courseId: number) {
    return `responder_${courseId}`;
  }

  static courseQuestionSubmitRoomId(courseId: number, activityId: number) {
    return `course_question_submit_${courseId}_${activityId}`;
  }

  static coursePaperSubmitRoomId(courseId: number, activityId: number) {
    return `course_paper_submit_${courseId}_${activityId}`;
  }
}
