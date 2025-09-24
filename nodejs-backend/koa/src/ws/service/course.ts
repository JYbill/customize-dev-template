// Ensure the path below points to the correct .ts or .d.ts file that exports StudentInfo
import type {
  StudentAnswerInfo,
  StudentInfo,
  StudentSignInfo,
} from "#app/types/service/coursesocket.d.ts";
import { globalLogger } from "#logger";
import { CoursePaper } from "#service/paper/course-paper.ts";
import { CourseQuestion } from "#service/question/course-question.ts";
import { CourseClientEvent } from "#ws/enum/course.ts";
import { SocketIOContainer } from "#ws/index.ts";
import { WSRoomUtilsService } from "#ws/utils/room.util.ts";

const logger = globalLogger.child({ fileFlag: "ws/service/course.ts" });

export class CourseWSService {
  /**
   * 学生加入课堂
   * @param courseId
   * @param studentInfo
   */
  static joinCourse(courseId: number, studentInfo: StudentInfo | undefined) {
    // 加入房间
    const namespace = SocketIOContainer.courseNamespace;
    const roomId = WSRoomUtilsService.calcCourseJoinId(courseId);
    namespace.to(roomId).emit(`${CourseClientEvent.STUDENT_JOIN_COURSE}:${courseId}`, studentInfo);
  }

  /**
   * 学生离开课堂
   * @param courseId
   * @param studentId
   */
  static leaveCourse(courseId: number, studentId: number) {
    // 离开房间
    const namespace = SocketIOContainer.courseNamespace;
    const roomId = WSRoomUtilsService.calcCourseJoinId(courseId);
    namespace.to(roomId).emit(`${CourseClientEvent.STUDENT_LEAVE_COURSE}:${courseId}`, studentId);
  }

  /**
   * 学生签到
   * @param courseId
   * @param studentInfo
   */
  static sendStudentSignIn(courseId: number, studentInfo: StudentSignInfo | undefined) {
    const namespace = SocketIOContainer.courseNamespace;
    const roomId = WSRoomUtilsService.calcCourseSignId(courseId);
    namespace.to(roomId).emit(`${CourseClientEvent.SIGN_IN}:${courseId}`, studentInfo);
  }

  /**
   * 更新签到二维码
   * @param courseId
   * @param qrUrl
   */
  static updateSignInQr(courseId: number, qrUrl: string) {
    const namespace = SocketIOContainer.courseNamespace;
    const roomId = WSRoomUtilsService.calcCourseSignId(courseId);
    namespace
      .to(roomId)
      .volatile.emit(`${CourseClientEvent.UPDATE_SIGN_IN_QR}:${courseId}`, { qrUrl, courseId });
  }

  /**
   * 结束签到
   */
  static autoEndSignIn(courseId: number, signId: number) {
    const namespace = SocketIOContainer.courseNamespace;
    const roomId = WSRoomUtilsService.calcCourseSignId(courseId);
    namespace
      .to(roomId)
      .emit(`${CourseClientEvent.AUTO_END_SIGN_IN}:${courseId}`, { courseId, signId });
  }

  /**
   * 学生抢答
   */
  static sendStudentAnswer(courseId: number, studentInfo: StudentAnswerInfo) {
    const namespace = SocketIOContainer.courseNamespace;
    const roomId = WSRoomUtilsService.calcResponderRoom(courseId);
    namespace.to(roomId).emit(`${CourseClientEvent.STUDENT_ANSWER}:${courseId}`, studentInfo);
  }

  static async courseQuestionSubmit(courseId: number, activityId: number, studentId: number) {
    console.log(new Date(), "Start send question submit event", {
      courseId,
      activityId,
      studentId,
    });
    const namespace = SocketIOContainer.courseNamespace;
    const roomId = WSRoomUtilsService.courseQuestionSubmitRoomId(courseId, activityId);
    const sockets = await namespace.to(roomId).fetchSockets();
    console.log(new Date(), { courseId, activityId, studentId, len: sockets.length });
    if (sockets.length === 0) return;
    const { submitList } = await CourseQuestion.getSubmitList(activityId, courseId, studentId);
    console.log(new Date(), submitList);
    namespace
      .to(roomId)
      .emit(`${CourseClientEvent.COURSE_QUESTION_SUBMIT}:${courseId}:${activityId}`, submitList[0]);
  }

  static async coursePaperSubmit(courseId: number, activityId: number, studentId: number) {
    const namespace = SocketIOContainer.courseNamespace;
    const roomId = WSRoomUtilsService.coursePaperSubmitRoomId(courseId, activityId);
    const sockets = await namespace.to(roomId).fetchSockets();
    if (sockets.length === 0) return;
    const { submitList } = await CoursePaper.getSubmitList(activityId, courseId, studentId);
    namespace
      .to(roomId)
      .emit(`${CourseClientEvent.COURSE_PAPER_SUBMIT}:${courseId}:${activityId}`, submitList[0]);
  }

  // 讨论活动配置发生改变
  static async discussionConfigChange(
    courseId: number,
    activityId: number,
    {
      isReplyPrivate,
      isVisible,
      isAnonymous,
      status,
    }: { isReplyPrivate: number; isVisible: number; isAnonymous: number; status: number },
  ) {
    const namespace = SocketIOContainer.courseNamespace;
    const roomId = WSRoomUtilsService.calcCourseDiscussionConfigId(courseId, activityId);
    const sockets = await namespace.to(roomId).fetchSockets();
    if (sockets.length === 0) return;
    namespace
      .to(roomId)
      .emit(`${CourseClientEvent.DISCUSS_CONFIG_CHANGE}:${courseId}:${activityId}`, {
        isReplyPrivate,
        isVisible,
        isAnonymous,
        status,
      });
  }

  // 讨论消息被删除
  static async discussionMsgDelete(courseId: number, activityId: number, msgId: number) {
    const namespace = SocketIOContainer.courseNamespace;
    const roomId = WSRoomUtilsService.calcCourseDiscussionConfigId(courseId, activityId);
    const sockets = await namespace.to(roomId).fetchSockets();
    if (sockets.length === 0) return;
    namespace
      .to(roomId)
      .emit(`${CourseClientEvent.DISCUSS_MSG_DELETE}:${courseId}:${activityId}`, { msgId });
  }
}
