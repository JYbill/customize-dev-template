import type { Context } from "koa";

import { HttpError } from "#error/http-error.ts";
import { CourseUpdate } from "#service/course/edit.ts";
import { Course } from "#service/course/query.ts";

export class CoursesController {
  /**
   * 更新课堂接口
   * @param ctx
   */
  static async putCourse(this: void, ctx: Context) {
    const requestBody = ctx.request.body as {
      curriculumId: number;
      courseId: number;
      name: string;
      scope: number;
    };

    // 校验课程 - 课堂是否绑定且存在
    const exist = await Course.existCourseByIds(requestBody.curriculumId, requestBody.courseId);
    if (!exist) {
      throw HttpError.throwRequestError("no exist course in curriculum");
    }

    // 更新名称
    ctx.body = await CourseUpdate.dbUpdateCourseReturnDataById({
      id: requestBody.courseId,
      data: {
        name: requestBody.name,
        scope: requestBody.scope,
      },
    });
  }
}
