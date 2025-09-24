import Joi from "joi";

import Router from "@koa/router";

import type { Context } from "koa";

import { CoursesController } from "#app/controller/router-handler/v1/courses.ts";
import { CourseValidator } from "#app/controller/validator/course.validator.ts";
import type { UpdateCourse } from "#app/types/database.d.ts";
import type { CommonContext } from "#app/types/library.js";
import { HttpError } from "#error/index.ts";
import uploader from "#lib/multer.ts";
import checkCurrentClass from "#middleware/check-current-class.ts";
import { Privilege } from "#middleware/privilege.ts";
import { validate } from "#middleware/validate.ts";
import { CourseUpdate } from "#service/course/edit.ts";
import { Course } from "#service/course/query.ts";
import { Monitor } from "#service/courseMonitor/index.ts";
import { MonitorCourseAccess } from "#service/courseMonitor/monitor-course-access.ts";
import { Library } from "#service/library/index.ts";
import { Term } from "#service/term/index.ts";
import { Upload } from "#service/upload/index.ts";
import type { PostCourseQuery } from "#types/controller/course.d.ts";
import type {
  CreateCourse,
  GetCourseInfoByTidRet,
  UpdateCourseConfig,
} from "#types/service/course.d.ts";
import { array2Map } from "#utils/lodash.util.ts";
import { xssProcess } from "#utils/xss.util.ts";

const router = new Router({
  prefix: "/v1/courses",
});

/**
 * 添加课堂
 */
router.post(
  "/",
  uploader.single("cover"),
  validate({
    body: {
      curriculumId: Joi.number().required(),
      name: Joi.string().required(),
      termId: Joi.number().required(),
      introduction: Joi.string().default(""),
    },
  }),
  async (ctx: Context) => {
    const body = ctx.request.body as PostCourseQuery;
    const user = ctx.state.user;
    const teacherId = user.teacherId;

    // 上传封面
    const file = ctx.file;
    let path = "";
    if (file) {
      path = await Upload.moveToPublicFolder(file);
    }

    const term = await Term.getTermById(body.termId);
    const library = await Library.dbGetLibraryByCurId(body.curriculumId);

    // const course = Course.formatInsertParam(body, teacherId, path); // 数据格式化
    const course: CreateCourse = {
      libraryId: library.id,
      name: xssProcess(body.name),
      teacher_id: teacherId,
      cover: path,
      is_lock: 0,
      is_public: 0,
      open_rule: 2,
      duration_rule: 5,
      answer_open_rule: 1,
      sign_duration: 5,
      termId: body.termId,
      termData: term,
      departmentId: user.departmentId,
      orgId: user.orgId,
      collegeId: user.collegeId,
      curriculumId: body.curriculumId,
      introduction: body.introduction,
      code: "",
    };

    // 创建课堂
    const courseId = await CourseUpdate.addCourse(course);

    ctx.body = await Course.getCourseDetail(courseId, teacherId);
  },
);

/**
 * 删除课堂api接口: 如果不是自己创建的无法删除
 */
router.delete(
  "/:id",
  validate({
    params: {
      id: Joi.number().required(),
    },
    body: {
      name: Joi.string().required(),
    },
  }),
  async (ctx: Context, next) => {
    const courseId = (ctx.params as { id: number }).id;
    const { name } = ctx.request.body as { name: string };
    const privilege = await Privilege.checkCourse(ctx, courseId);
    if (!privilege.write) {
      throw HttpError.throwRequestError("current user has no permission to delete this course");
    }
    const courseInfo = await Course.dbQueryCourseInfoById(courseId);
    if (courseInfo.name !== name) {
      throw HttpError.throwRequestError("课堂名称不匹配，无法删除");
    }
    const teacherId = ctx.state.user.id;
    await CourseUpdate.deleteCourse(courseId, teacherId);
    ctx.body = {
      success: true,
    };
    await next();
  },
);

/**
 * 更新课程下的课堂
 */
router.put(
  "/info",
  validate({
    body: CourseValidator.putCourse,
  }),
  CoursesController.putCourse,
);

/**
 * 更新课堂RPC接口
 */
router.put(
  "/info/rpc",
  validate({
    body: CourseValidator.putCourse,
  }),
  CoursesController.putCourse,
);

/**
 * 教师所有课堂列表
 */
router.get(
  "/list",
  validate({
    query: {
      name: Joi.string().allow(""),
      hiddenManual: Joi.boolean().failover(false), // 隐藏老师自建课堂
    },
  }),
  async (ctx: Context) => {
    const teacherId = ctx.state.user.id;
    const query = ctx.query as { name: string; hiddenManual: boolean };

    const formatCourseList: Record<string, GetCourseInfoByTidRet[]>[] = [];
    let courseList = await Course.dbGetCoursesByTId({ teacherId, ...query });
    const courseIdList = courseList.map((item) => item.id); // 所有教师的课堂id列表

    // 当前教师的录播数据
    const monitorList = await Monitor.getMonitorCountByCourses(teacherId, courseIdList);
    const monitorMap = array2Map(monitorList, "courseId");

    courseList
      // 格式化：课次总数
      .map((item) => {
        const courseId = item.id;
        const schedule = monitorMap[courseId];
        let courseScheduleCount = 0;
        if (schedule) {
          courseScheduleCount = schedule.courseScheduleCount;
        }
        return { ...item, courseScheduleCount: courseScheduleCount };
      })
      // 排序：有限按年份，再按'秋'、'春'（拼音排序）
      .sort((next, curr) => {
        if (next.startYear !== curr.startYear) {
          return curr.startYear - next.startYear;
        }
        return curr.term.localeCompare(next.term);
      })
      // 格式化：格式化：{ [${startYear}•${term}]: {...} }的结构
      .forEach((item) => {
        const termKey = `${item.startYear}年` + "•" + item.term;
        const termItem = formatCourseList.find((item) => !!item[termKey]);
        if (!termItem) {
          formatCourseList.push({ [termKey]: [item] });
          return;
        }
        termItem[termKey].push(item);
      });

    ctx.body = formatCourseList;
  },
);

/**
 * 学生录播列表
 */
router.get(
  "/student/list",
  validate({
    query: {
      name: Joi.string().allow(""),
    },
  }),
  async (ctx: Context, next) => {
    const { id: studentId } = ctx.state.user;
    const { name } = ctx.query as { name: string };
    ctx.body = await Course.getCoursesBySid(studentId, name);
  },
);

router.get(
  "/by-student/:courseId",
  validate({
    params: {
      courseId: Joi.number().required(),
    },
  }),
  async (ctx: Context, next) => {
    const studentId = ctx.state.user.id;
    const courseId = ctx.params.courseId;

    const exist = await Course.checkStudentInCourse(studentId, courseId);
    // logger.info("%s, %s, exist: %s", studentId, courseId, exist); // debug
    if (!exist) {
      throw HttpError.throwRequestError("current student is not in this course");
    }

    const courseInfo = await Course.studentGetCourseInfoById(courseId);
    ctx.body = courseInfo;
  },
);

/**
 * 获取课堂数据分析
 */
router.get(
  "/:id/analysis",
  validate({
    query: {
      startTime: Joi.string(),
      endTime: Joi.string(),
    },
  }),
  async (ctx: Context, next) => {
    const { startTime, endTime } = ctx.query;
    ctx.body = await Course.getCourseAnalysis(ctx.params.id, startTime, endTime);
    await next();
  },
);

/**
 * 获取老师单个课堂的数据分析
 */
router.get("/:id/records/:recordId/analysis", async (ctx: Context, next) => {
  const { id: teacherId } = ctx.state.user;
  const { id: courseId } = ctx.params;
  await Monitor.allowVisitMonitor(teacherId, ctx.params.recordId);
  ctx.body = await Course.getCourseRecordAnalysis(ctx.params.recordId);
  await next();
});

/**
 * 数据分析 - 学生查看详情
 */
router.get(
  "/:id/analysis/student",
  validate({
    query: {
      startTime: Joi.string(),
      endTime: Joi.string(),
    },
  }),
  async (ctx: Context, next) => {
    const { startTime, endTime }: any = ctx.query;
    ctx.body = await MonitorCourseAccess.getStudentAccessInfoByCid(
      ctx.params.id,
      startTime,
      endTime,
    );
    await next();
  },
);

/**
 * 课堂整体录播分析 - 导出学生详情excel表格
 */
router.get(
  "/:courseId/analysis/students/export",
  validate({
    params: {
      courseId: Joi.number().required(),
    },
  }),
  async (ctx: Context, next) => {
    const { courseId } = ctx.params;
    const { id: teacherId } = ctx.state.user;
    const { buffer, fileName } = await Course.exportCourseStudentInfo(courseId);
    ctx.response.attachment(fileName);
    ctx.body = buffer;
    await next();
  },
);

/**
 * 导出上课记录
 */
router.get(
  "/:id/export",
  validate({
    query: {
      startTime: Joi.string(),
      endTime: Joi.string(),
    },
  }),
  async (ctx: Context, next) => {
    const { startTime, endTime } = ctx.query;
    const { buffer, fileName } = await Course.exportCourseAnalysis(
      ctx.params.id,
      startTime,
      endTime,
    );
    ctx.response.attachment(fileName);
    ctx.body = buffer;
    await next();
  },
);

/**
 * 导出数据分析-学生查看数据详情记录
 */
router.get("/records/:recordId/export", async (ctx: Context, next) => {
  const { buffer, fileName } = await Course.exportCourseRecordAnalysis(ctx.params.recordId);
  ctx.response.attachment(fileName);
  ctx.body = buffer;
  await next();
});

router.get("/:id/records", async (ctx: Context, next) => {
  const { id: teacherId } = ctx.state.user;
  const record = await Course.getCourseRecords(ctx.state.user.collegeId, ctx.params.id, teacherId);
  ctx.body = record;
  await next();
});

router.get("/:id/records/:recordId", async (ctx: Context, next) => {
  const { id: teacherId } = ctx.state.user;
  await Monitor.allowVisitMonitor(teacherId, ctx.params.recordId);
  ctx.body = await Monitor.getCourseRecord(ctx.params.recordId);
  await next();
});
router.get(
  "/records/info/:scheduleId",
  async (ctx: CommonContext<{ scheduleId: number }>, next) => {
    ctx.body = await Monitor.getCourseRecordByScheduleId(ctx.params.scheduleId);
    await next();
  },
);

/**
 * 编辑上课记录
 */
router.put(
  "/:id/records/:recordId",
  validate({
    body: {
      title: Joi.string().required(),
      description: Joi.string().allow(""),
      cover: Joi.string(),
      allowReview: Joi.number().valid(0, 1).default(0),
    },
  }),
  async (ctx: Context, next) => {
    const { title, description, cover, allowReview } = ctx.request.body as any;
    ctx.body = await Course.updateCourseRecord(
      ctx.params.recordId,
      title,
      description,
      cover,
      allowReview,
    );
    await next();
  },
);

router.put(
  "/records/review/:id",
  validate({
    body: {
      allowReview: Joi.number().valid(0, 1).required(),
    },
  }),
  async (ctx: Context) => {
    const { allowReview } = ctx.request.body as { allowReview: number };
    const params = ctx.params as { id: number; recordId: number };
    ctx.body = await Course.updateAllowReviewStatus(params.id, allowReview);
  },
);

/**
 * 获取课程详情信息
 */
router.get("/:id", checkCurrentClass, async (ctx: Context, next) => {
  let courseId = (ctx.params as { id: number }).id;
  const teacherId = ctx.state.user.id;
  // 验证当前用户对请求资源的权限
  const privilege = await Privilege.checkCourse(ctx, courseId);
  if (!privilege.read) {
    throw HttpError.throwForbiddenError("forbidden, does not belong to the current user");
  }

  //记录日志
  ctx.body = await Course.getCourseDetail(courseId, teacherId);
  await next();
});
// 编辑课堂信息
router.put(
  "/:id/settings",
  validate({
    params: {
      id: Joi.number().required(),
    },
    body: {
      name: Joi.string().max(100).required(),
      answerDuration: Joi.number()
        .required()
        .min(1)
        .max(600)
        .default(5)
        .description("课堂时长规则"),
      answerRule: Joi.number().required().valid(1, 2).default(1).description("答案公布规则"),
      signDuration: Joi.number().required().min(1).max(60).default(5).description("签到时长"),
      isLocked: Joi.number().valid(0, 1).default(0).description("是否锁定课堂"),
    },
  }),
  async (ctx: Context) => {
    const courseId = (ctx.params as { id: number }).id;
    const privilege = await Privilege.checkCourse(ctx, courseId);
    if (!privilege.write) {
      throw HttpError.throwForbiddenError("forbidden, does not belong to the current user");
    }
    const { name, answerDuration, answerRule, signDuration, isLocked } = ctx.request
      .body as UpdateCourseConfig;
    const params: UpdateCourse = {
      name,
      durationRule: answerDuration,
      answerOpenRule: answerRule,
      signDuration: signDuration,
      isLock: isLocked,
    };
    await CourseUpdate.dbUpdateCourseInfo(courseId, params);
    ctx.body = {
      success: true,
    };
  },
);
export { router };
