export const ErrorCode = Object.freeze({
  // 前端参数错误
  FRONT_PARAMS: 40001,
  FRONT_LOGIC: 40002,

  // 后端通用错误 40100-40199 reserved
  UNKNOWN_ERROR: 40100, // 未知错误
  UNCATCH_ERROR: 40101, // 未捕获错误
  BACKEND_LOGIC_ERROR: 40102, // 后台逻辑错误
  DB_ERROR: 40103, // DB错误

  // 答题活动错误码 40200-40299 reserved
  // 学生查看单题详情
  questionActivityNotFound: 40200, // 答题活动不存在
  questionNotStart: 40201, // 答题活动未开始
  questionNotAllowedToRevise: 40202, // 此答题活动不允许复习
  // 学生提交单题
  questionAlreadySubmitted: 40203, // 此答题活动已提交
  questionActivityClosed: 40204, // 此答题活动已关闭
  answerFormatError: 40205, // 答案格式错误

  // SPOC相关错误码
  spocChapterNotAllowEnter: 40300, // SPOC章节暂未开启，不允许学生进入
});
