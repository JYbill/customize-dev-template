import { globalLogger } from "#logger";
import type { FreeTeamCacheDetail } from "#types/service/team.d.ts";
import type { SendJoinTeamMsg } from "#types/ws/course.d.ts";
import { CourseClientEvent } from "#ws/enum/course.ts";
import { SocketIOContainer } from "#ws/index.ts";
import { ClientEventCalculator } from "#ws/utils/client-event.util.ts";
import { WSRoomUtilsService } from "#ws/utils/room.util.ts";
import WSUtil from "#ws/utils/ws.util.ts";

const logger = globalLogger.child({ fileFlag: "ws/service/team.ts" });

export class WsTeamService {
  /**
   * 学生加入小组，给房间内的所有老师发送消息组播
   */
  static async sendJoinTeamMsgForTeacher(payload: SendJoinTeamMsg) {
    const courseId = payload.courseId;
    const schemaId = payload.schemaId;
    const roomId = WSRoomUtilsService.calcTeacherJoinTeamRoom(courseId, schemaId);
    const namespace = SocketIOContainer.courseNamespace;
    await WSUtil.emitAckFromRoom({
      namespace,
      roomId,
      event: ClientEventCalculator.joinTeam(courseId, schemaId),
      payload,
    }).catch((error) => {
      logger.error("sendJoinTeamMsgForTeacher ack emit error: %o", error);
    });
  }

  /**
   * 学生加入小组，给房间内的所有学生发送消息组播
   * 💡 每次发送学生都是所有的分组与学生详情，所以丢不丢包无所谓
   */
  static sendJoinTeamMsgForStudent(
    courseId: number,
    schemaId: number,
    payload: FreeTeamCacheDetail[],
  ) {
    const roomId = WSRoomUtilsService.calcStudentJoinTeamRoom(courseId, schemaId);
    const namespace = SocketIOContainer.courseNamespace;
    namespace.to(roomId).emit(ClientEventCalculator.studentJoinTeam(courseId, schemaId), payload);
  }

  /**
   * 给学生、老师监听的分组事件发送分组已完成消息
   */
  static sendFinishGroupMsg(courseId: number, schemaId: number) {
    const namespace = SocketIOContainer.courseNamespace;
    const studentRoomId = WSRoomUtilsService.calcStudentJoinTeamRoom(courseId, schemaId);
    const teacherRoomId = WSRoomUtilsService.calcTeacherJoinTeamRoom(courseId, schemaId);
    namespace.to(teacherRoomId).emit(CourseClientEvent.COMPLETE, {
      key: ClientEventCalculator.joinTeam(courseId, schemaId),
      data: {},
    });
    namespace.to(studentRoomId).emit(CourseClientEvent.COMPLETE, {
      key: ClientEventCalculator.studentJoinTeam(courseId, schemaId),
      data: {},
    });
  }
}
