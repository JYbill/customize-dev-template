export const ErrorCode = Object.freeze({
  // 前端参数错误
  FRONT_PARAMS: 40001,
  FRONT_LOGIC: 40002,
  FRONT_LOGIC_TIMOUT: 40003, // 前端逻辑性的超时

  // 后端通用错误 40100-40199 reserved
  UNKNOWN_ERROR: 40100, // 未知错误
  UNCATCH_ERROR: 40101, // 未捕获错误
  BACKEND_LOGIC_ERROR: 40102, // 后台逻辑错误
  DB_ERROR: 40103, // DB错误
  UN_AUTHENTICATION: 40104, // 未认证
  FORBIDDEN: 40105, // 未授权
  PREEMPT_LOCK_FAILED: 40106, // 获取分布式锁失败

  // 答题活动错误码 40200-40299 reserved
  // 学生查看单题详情
  questionActivityNotFound: 40200, // 答题活动不存在
  questionNotStart: 40201, // 答题活动未开始
  questionNotAllowedToRevise: 40202, // 此答题活动不允许复习
  // 学生提交单题
  questionAlreadySubmitted: 40203, // 此答题活动已提交
  questionActivityClosed: 40204, // 此答题活动已关闭
  answerFormatError: 40205, // 答案格式错误
  questionAlreadyScored: 40208, // 此答题活动已评分
  // 批阅题目
  scoreOutOfRange: 40206, // 分数超出范围
  // 课堂答题活动
  questionAlreadyInTargetStatus: 40207, // 活动已经在目标状态，可以做温柔提示

  // SPOC相关错误码
  spocChapterNotAllowEnter: 40300, // SPOC章节暂未开启，不允许学生进入

  // 直播活动错误码 40400-40499 reserved
  liveTimeConfigError: 40400, // 直播时段配置错误

  // 作业相关错误码 40500-40599 reserved
  homeworkActivityNotFound: 40500, // 作业活动不存在
  homeworkNotAllowedToRepeat: 40501, // 作业不允许重复提交了
  homeworkNotAllowedToSubmit: 40502, // 作业不允许提交了
  HOMEWORK_NOT_FOUND: 40503, // 作业不存在
  homeworkTooLangComment: 40504, // 作业批语内容过长
  homeworkReqError: 40505, // 作业请求地址错误
  homeworkNoActivity: 40506, // 作业活动不存在或已关闭
  homeworkNoRecord: 40507, // 作业记录不存在
  homeworkNoCorrect: 40508, // 作业未批改
  homeworkNoStudent: 40509, // 课堂无此学生
  homeworkNoPublish: 40510, // 发布作业不存在
  homeworkNoCourse: 40511, // 课堂不存在
  homeworkHasOver: 40512, // 作业已结束
  homeworkHasStart: 40513, // 作业已开始
  homeworkHasCorrect: 40514, //作业已开始互评
  homeworkHasEnd: 40515, // 作业已截至
  homeworkHasCorrectEnd: 40516, //作业已结束互评
  homeworkEmptyCorrectContent: 40517, // 批改内容为空
  homeworkNoCorrectTask: 40518, // 批改任务不存在
  homeworkNoSetting: 40519, //作业设置不存在

  homeworkCanNotCorrect: 40520, //作业不能互评
  homeworkNoTeam: 40521, //课堂没有小组
  homeworkNoExist: 40522, //作业不存在
  homeworkNoScoreSetting: 40523, //作业没有评分设置
  homeworkNoDivideTask: 40524, //作业没有分任务
  homeworkStatusError: 40525, //作业状态错误
  homeworkHasRejected: 40526, //作业已驳回

  homeworkParmCourse: 40550, // 课堂参数错误
  homeworkParmStarttime: 40551, // 开始时间参数错误
  homeworkParmEndtime: 40552, // 结束时间参数错误
  homeworkParmCorrectEndtime: 40553, // 批改结束时间参数错误
  homeworkParmWeight: 40554, //权重之和不为1
  homeworkParmUrgeTime: 40555, //催交时间错误
  homeworkParmCorrectCount: 40556, //互评人数过多

  // 课堂签到相关错误码 40600-40699 reserved
  attendanceNotFound: 40600, // 签到活动不存在
  attendanceAlreadyClosed: 40603, // 签到活动已关闭
  // 未加入当前课堂
  attendanceNotInCurrentCourse: 40601, // 未加入当前课堂
  // 二维码已过期
  attendanceQrCodeOverdue: 40602, // 二维码已过期
  // 重复签到
  attendanceAlreadySigned: 40604, // 重复签到
  // 签到进行中无法删除
  attendanceInProgressCannotDelete: 40605, // 签到进行中无法删除
  // 已有开启的签到
  attendanceAlreadyHasOpenSign: 40606, // 已有开启的签到
  // 课堂不存在
  attendanceCourseNotFound: 40607, // 课堂不存在

  // 加入课堂相关错误码 40700-40799 reserved
  courseNotFound: 40700, // 课堂不存在
  courseAlreadyJoined: 40701, // 已经加入课堂
  courseIsLocked: 40702, // 课堂已锁定
  courseIsArchived: 40703, // 课堂已归档
  courseNotJoined: 40704, // 学生未加入课堂

  // 成绩中心相关错误码 40800-40899 reserved
  gradeCalculating: 40800, // 成绩计算中，请勿重复提交
  gradeRegularItemNotFull: 40801, // 平时成绩项总值未满足100
  gradeCompositeItemNotFull: 40802, // 综合成绩项总值未满足100
  gradeItemInvalid: 40803, // 成绩项参数不合法
});

export const SocketErrorCode = Object.freeze({
  // 前端参数错误
  FRONT_PARAMS: 40001,
  FRONT_LOGIC: 40002,

  // 后端通用错误 40100-40199 reserved
  UNKNOWN_ERROR: 40100, // 未知错误
  UNCATCH_ERROR: 40101, // 未捕获错误
  BACKEND_LOGIC_ERROR: 40102, // 后台逻辑错误
  DB_ERROR: 40103, // DB错误
  UN_AUTHENTICATION: 40104, // 未认证
  FORBIDDEN: 40105, // 未授权

  // socket连接错误
  SOCKET_CONNECT_ERROR: 50001,
  // socket断开连接
  SOCKET_DISCONNECT: 50002,
  // socket连接超时
  SOCKET_CONNECT_TIMEOUT: 50003,
});
