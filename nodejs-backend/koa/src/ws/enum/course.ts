export const CourseMessageType = Object.freeze({
  // 文字消息
  TEXT: "text",
  // 图片消息
  IMAGE: "image",
});

// 监听加入房间事件
export const CourseRoomEvent = Object.freeze({
  // 加入签到socket房间
  JOIN_SIGN_IN_ROOM: "joinSignInRoomService",

  // 加入课堂socket房间
  JOIN_COURSE_ROOM: "joinCourseRoomService",

  // 学生加入讨论
  STUDENT_DISCUSS: "studentDiscussRoomService",
  // 老师加入讨论
  TEACHER_DISCUSS: "teacherDiscussRoomService",
  LEAVE_DISCUSS: "leaveDiscussRoomService",

  // 分组
  // 加入小组事件
  JOIN_TEAM_SERVICE: "joinTeamRoomService",
  // 学生加入小组事件（学生加入）
  STUDENT_JOIN_TEAM: "studentJoinTeamRoomService",

  // 点答相关
  // 老师加入点答事件
  JOIN_RESPONDER: "joinResponderRoomService",

  // 加入小组事件
  JOIN_TEAM: "joinTeamRoomService",

  // 答题活动
  // 订阅单题提交消息
  SUBSCRIBE_COURSE_QUESTION: "subscribeCourseQuestionSubmitRoomService",

  // 订阅组卷提交消息
  SUBSCRIBE_COURSE_PAPER: "subscribeCoursePaperSubmitRoomService",
});

// 服务端监听事件
export const CourseServiceEvent = Object.freeze({
  // 学生发送消息
  STUDENT_MESSAGE: "studentMessageService",
  // 老师发送消息
  TEACHER_MESSAGE: "teacherMessageService",
});

// 客户端监听事件
export const CourseClientEvent = Object.freeze({
  // 事件完成的特殊事件：用于告知前端哪个事件已经完成（但又不能将socket断开的场景）
  COMPLETE: "completeClient",

  //学生加入课堂
  STUDENT_JOIN_COURSE: "studentJoinCourseClient",
  // 学生离开课堂
  STUDENT_LEAVE_COURSE: "studentLeaveCourseClient",

  // 签到
  SIGN_IN: "signInClient",
  // 更新签到二维码
  UPDATE_SIGN_IN_QR: "updateSignInQrClient",
  // 自动任务结束签到
  AUTO_END_SIGN_IN: "autoEndSignIn",
  // 答题
  ANSWER: "answer",

  // 分组
  // 教师监听学生加入课堂事件
  JOIN_TEAM: "joinTeamClient",
  // 学生监听学生加入课堂事件
  STUDENT_JOIN_TEAM: "studentJoinTeamClient",

  // 点答相关
  // 老师加入点答事件
  JOIN_RESPONDER: "joinResponder",
  // 学生抢答
  STUDENT_ANSWER: "studentAnswerClient",

  // 组卷提交消息
  COURSE_PAPER_SUBMIT: "coursePaperSubmitClient",

  // 单题提交消息
  COURSE_QUESTION_SUBMIT: "courseQuestionSubmitClient",
  // 发送消息
  SEND_MESSAGE: "sendMessageClient",
  // 讨论配置发生改变
  DISCUSS_CONFIG_CHANGE: "discussConfigChangeClient",

  DISCUSS_MSG_DELETE: "discussMsgDeleteClient",
});
