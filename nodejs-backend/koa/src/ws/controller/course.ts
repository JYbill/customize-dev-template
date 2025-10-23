import type { Server } from "socket.io";

import { DiscussionTeamType } from "#app/enum/discussion.enum.ts";
import { globalLogger } from "#app/library/logger/index.ts";
import { DiscussionService } from "#app/service/discussion/index.ts";
import { DiscussionQueryService } from "#app/service/discussion/query.ts";
import { SocketError } from "#error/index.ts";
import { Team } from "#service/team/query.ts";
import type { AppNamespace, AppSocket } from "#types/library.d.ts";
import { ClientEventCalculator } from "#ws/utils/client-event.util.ts";
import { WSRoomUtilsService } from "#ws/utils/room.util.ts";

import { CourseClientEvent, CourseRoomEvent, CourseServiceEvent } from "../enum/course.ts";

const logger = globalLogger.child({ fileFlag: "ws/controller/course.ts" });
export class CourseWSController {
  static router(io: Server) {
    const courseNamespace = io.of("/course") as AppNamespace;
    // 监听消息部分，只处理被动消息行为，主动消息行为在service部分
    courseNamespace.on("connection", async (socket: AppSocket) => {
      if (socket.recovered) {
        logger.info("User reconnected:", socket.id);
        // 重连
        await socket
          .emitWithAck("reconnected", {
            message: "You have been reconnected",
            socketId: socket.id,
          })
          .catch((error: Error) => {
            logger.error("Error during reconnection:", error);
          });
      }
      // 老师监听加入课堂
      socket.on<"joinCourseRoomService">(CourseRoomEvent.JOIN_COURSE_ROOM, async ({ courseId }) => {
        const roomId = WSRoomUtilsService.calcCourseJoinId(courseId);
        // 加入房间
        await socket.join(roomId);
        socket.emit(CourseRoomEvent.JOIN_COURSE_ROOM, "success"); // history
        // socket.emit("chatHistory", "历史消息"); // history
      });

      // 老师加入签到聊天室
      socket.on<"joinSignInRoomService">(
        CourseRoomEvent.JOIN_SIGN_IN_ROOM,
        async ({ courseId }) => {
          if (socket.data.teacherId) {
            const roomId = WSRoomUtilsService.calcCourseSignId(courseId);
            // 加入房间
            await socket.join(roomId);
            socket.emit(CourseRoomEvent.JOIN_SIGN_IN_ROOM, "success"); // history
          } else {
            throw SocketError.throwForbiddenError(socket, "请先登录教师账号");
          }
        },
      );

      // 老师加入讨论
      socket.on<"teacherDiscussRoomService">(
        CourseRoomEvent.TEACHER_DISCUSS,
        async ({ courseId, activityId }) => {
          if (socket.data.teacherId) {
            const activityInfo =
              await DiscussionQueryService.dbQueryDiscussionActivityById(activityId);
            if (!activityInfo || activityInfo.status !== 1) {
              throw SocketError.throwRequestError(socket, "讨论活动不存在或未开启");
            }
            const roomId = WSRoomUtilsService.calcCourseDiscussionId(courseId, activityId);
            // 加入房间
            await socket.join(roomId);
            // 加入discussion config房间，用于接收讨论配置变更消息
            const configRoomId = WSRoomUtilsService.calcCourseDiscussionConfigId(
              courseId,
              activityId,
            );
            await socket.join(configRoomId);
            socket.emit(CourseRoomEvent.TEACHER_DISCUSS, "success");
          } else {
            throw SocketError.throwForbiddenError(socket, "请先登录教师账号");
          }
        },
      );
      // 离开讨论
      socket.on<"leaveDiscussRoomService">(
        CourseRoomEvent.LEAVE_DISCUSS,
        async ({ courseId, activityId }) => {
          const roomId = WSRoomUtilsService.calcCourseDiscussionId(courseId, activityId);
          // 离开房间
          await socket.leave(roomId);
          socket.emit(CourseRoomEvent.LEAVE_DISCUSS, "success");
        },
      );
      // 学生加入讨论
      socket.on<"studentDiscussRoomService">(
        CourseRoomEvent.STUDENT_DISCUSS,
        async ({ courseId, activityId }) => {
          if (socket.data.studentId) {
            const activityInfo =
              await DiscussionQueryService.dbQueryDiscussionActivityById(activityId);
            if (!activityInfo || activityInfo.status !== 1) {
              throw SocketError.throwRequestError(socket, "讨论活动不存在或未开启");
            }
            let roomId = "";
            let teamId = 0;
            if (activityInfo.teamType !== DiscussionTeamType.NO_GROUP) {
              // 分组讨论模式
              // 查询teamId
              teamId = await Team.dbGetStudentTeamId(
                socket.data.studentId,
                courseId,
                activityInfo.schemaId,
              );
              if (!teamId) {
                throw SocketError.throwForbiddenError(socket, "学生未分组，无法加入讨论");
              }
              // 计算分组讨论房间号
              roomId = WSRoomUtilsService.calcCourseDiscussionIdWithTeam(
                courseId,
                activityId,
                teamId,
              );
            } else {
              roomId = WSRoomUtilsService.calcCourseDiscussionId(courseId, activityId);
            }
            // 加入房间
            await socket.join(roomId);
            // 加入discussion config房间，用于接收讨论配置变更消息
            const configRoomId = WSRoomUtilsService.calcCourseDiscussionConfigId(
              courseId,
              activityId,
            );
            await socket.join(configRoomId);
            await socket.emitWithAck(CourseRoomEvent.STUDENT_DISCUSS, "success");
          } else {
            throw SocketError.throwForbiddenError(socket, "请先登录学生账号");
          }
        },
      );

      // 学生发送消息
      socket.on<"studentMessageService">(
        CourseServiceEvent.STUDENT_MESSAGE,
        async ({ courseId, activityId, msg, type }, callback) => {
          if (socket.data.studentId === undefined) {
            throw SocketError.throwForbiddenError(socket, "请先登录学生账号");
          }
          const activityInfo =
            await DiscussionQueryService.dbQueryDiscussionActivityById(activityId);
          if (!activityInfo || activityInfo.status !== 1) {
            throw SocketError.throwRequestError(socket, "讨论活动不存在或未开启");
          }
          let teamRoomId = "";
          let teamId = 0;
          if (activityInfo.teamType !== DiscussionTeamType.NO_GROUP) {
            // 分组讨论模式
            teamId = await Team.dbGetStudentTeamId(
              socket.data.studentId,
              courseId,
              activityInfo.schemaId,
            );
            if (!teamId) {
              throw SocketError.throwForbiddenError(socket, "学生未分组，无法发送消息");
            }
            // 计算分组讨论房间号
            teamRoomId = WSRoomUtilsService.calcCourseDiscussionIdWithTeam(
              courseId,
              activityId,
              teamId,
            );
          }
          const roomId = WSRoomUtilsService.calcCourseDiscussionId(courseId, activityId);
          // 存储到数据库
          const result = await DiscussionService.cacheMsgLog({
            courseId,
            activityId,
            type,
            msg: msg,
            isTeacher: 0, // 学生发送的消息
            studentId: socket.data.studentId,
            teacherId: 0, // 学生发送的消息没有教师ID
            teamId,
            date: new Date(),
          });
          // 广播给指定房间
          courseNamespace
            .to(roomId)
            .emit(`${CourseClientEvent.SEND_MESSAGE}:${courseId}:${activityId}`, result);
          if (teamRoomId) {
            courseNamespace
              .to(teamRoomId)
              .emit(`${CourseClientEvent.SEND_MESSAGE}:${courseId}:${activityId}`, result);
          }
          callback({ success: true, result });

          // void DiscussionModifyService.saveMsgLog({});
        },
      );

      // 老师发送消息
      socket.on<"teacherMessageService">(
        CourseServiceEvent.TEACHER_MESSAGE,
        async ({ courseId, activityId, msg, type, teamId }, callback) => {
          if (socket.data.teacherId === undefined) {
            throw SocketError.throwForbiddenError(socket, "请先登录教师账号");
          }
          const activityInfo =
            await DiscussionQueryService.dbQueryDiscussionActivityById(activityId);
          if (!activityInfo || activityInfo.status !== 1) {
            throw SocketError.throwRequestError(socket, "讨论活动不存在或未开启");
          }
          if (activityInfo.teamType !== DiscussionTeamType.NO_GROUP && teamId === undefined) {
            throw SocketError.throwRequestError(socket, "分组讨论模式，请传入分组id");
          }
          const roomId = WSRoomUtilsService.calcCourseDiscussionId(courseId, activityId);
          let teamRoomId = "";
          if (teamId && activityInfo.teamType !== DiscussionTeamType.NO_GROUP) {
            // 发送给指定分组
            teamRoomId = WSRoomUtilsService.calcCourseDiscussionIdWithTeam(
              courseId,
              activityId,
              teamId,
            );
          }
          // 存入数据库
          const result = await DiscussionService.cacheMsgLog({
            courseId,
            activityId,
            type,
            msg: msg,
            isTeacher: 1, // 学生发送的消息
            studentId: 0,
            teacherId: socket.data.teacherId, // 学生发送的消息没有教师ID
            teamId,
            date: new Date(),
          });
          // 广播给指定房间
          courseNamespace
            .to(roomId)
            .emit(`${CourseClientEvent.SEND_MESSAGE}:${courseId}:${activityId}`, result);
          if (teamRoomId) {
            courseNamespace
              .to(teamRoomId)
              .emit(`${CourseClientEvent.SEND_MESSAGE}:${courseId}:${activityId}`, result);
          }
          callback({ success: true, result });
        },
      );

      /**
       * 课堂分组事件
       */
      // 老师：加入课堂小组事件
      socket.on<"joinTeamRoomService">(
        CourseRoomEvent.JOIN_TEAM,
        async ({ courseId, schemaId }) => {
          schemaId = await Team.getSchemaIdByParams({ courseId, schemaId });
          const roomId = WSRoomUtilsService.calcTeacherJoinTeamRoom(courseId, schemaId);
          await socket.join(roomId);
        },
      );
      // 学生：加入课堂小组事件
      socket.on<"studentJoinTeamRoomService">(
        CourseRoomEvent.STUDENT_JOIN_TEAM,
        async ({ courseId, schemaId }) => {
          schemaId = await Team.getSchemaIdByParams({ courseId, schemaId });
          const roomId = WSRoomUtilsService.calcStudentJoinTeamRoom(courseId, schemaId);
          await socket.join(roomId);

          // 发送当前分组情况
          const teamCaches = await Team.getTeamCacheDetails(courseId, schemaId);
          socket.emit(ClientEventCalculator.studentJoinTeam(courseId, schemaId), teamCaches);
        },
      );

      // 老师加入点答事件
      socket.on<"joinResponderRoomService">(
        CourseRoomEvent.JOIN_RESPONDER,
        async ({ courseId }) => {
          if (socket.data.teacherId) {
            const roomId = WSRoomUtilsService.calcResponderRoom(courseId);
            // 广播给指定房间
            await socket.join(roomId);
            await socket.emitWithAck(CourseRoomEvent.JOIN_RESPONDER, "success");
          } else {
            throw SocketError.throwForbiddenError(socket, "请先登录教师账号");
          }
        },
      );

      // 订阅单题提交消息
      socket.on<"subscribeCourseQuestionSubmitRoomService">(
        CourseRoomEvent.SUBSCRIBE_COURSE_QUESTION,
        async (data, callback) => {
          if (socket.data.teacherId) {
            if (typeof data === "string") {
              data = JSON.parse(data) as {
                courseId: number;
                activityId: number;
              };
            }
            const { courseId, activityId } = data;
            const roomId = WSRoomUtilsService.courseQuestionSubmitRoomId(courseId, activityId);
            await socket.join(roomId);
            callback({ success: true });
          } else {
            throw SocketError.throwForbiddenError(socket, "请先登录教师账号");
          }
        },
      );

      // 订阅组卷提交消息
      socket.on<"subscribeCoursePaperSubmitRoomService">(
        CourseRoomEvent.SUBSCRIBE_COURSE_PAPER,
        async (data, callback) => {
          if (socket.data.teacherId) {
            if (typeof data === "string") {
              data = JSON.parse(data) as {
                courseId: number;
                activityId: number;
              };
            }
            const { courseId, activityId } = data;
            const roomId = WSRoomUtilsService.coursePaperSubmitRoomId(courseId, activityId);
            await socket.join(roomId);
            callback({ success: true });
          } else {
            throw SocketError.throwForbiddenError(socket, "请先登录教师账号");
          }
        },
      );

      // 断开连接
      socket.on("disconnect", (reason: string) => {
        console.log("User disconnected,reason:", reason);
      });
      // 错误处理
      socket.on("error", (error: Error) => {
        console.error("Socket error:", error);
        socket.emit("error", {
          message: "An error occurred",
          error: error.message,
        });
      });
    });
    return courseNamespace;
  }
}
