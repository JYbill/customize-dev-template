import Joi from "joi";

import { CourseScope } from "#enum/course.enum.ts";

export class CourseValidator {
  static putCourse = {
    curriculumId: Joi.number().required(),
    courseId: Joi.number().required(),
    name: Joi.string(),
    scope: Joi.number().valid(...Object.values(CourseScope)),
  };
}
