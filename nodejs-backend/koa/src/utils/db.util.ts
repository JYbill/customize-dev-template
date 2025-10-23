import { type Expression, expressionBuilder, jsonArrayFrom, jsonObjectFrom, sql } from "#db";
import type { DB } from "#types/database.d.ts";

export class StudentDBUtil {
  /**
   * 学生信息字段
   */
  static getStudentInfoFields() {
    return [
      sql<string>`student.name`.as("studentName"),
      sql<string>`student.avatar`.as("studentAvatar"),
      sql<number>`student.gender`.as("studentSex"),
      sql<string>`student.student_number`.as("studentNumber"),
      sql<string>`specialty.code`.as("specialtyCode"),
      sql<string>`specialty.name`.as("specialtyName"),
      sql<string>`specialty.short_name`.as("specialtyShortName"),
      sql<string>`department.department_name`.as("departmentName"),
      sql<string>`class.name`.as("className"),
    ];
  }

  /**
   * 根据ref_team_student.team_id获取所有学生通用信息
   * @param refId
   */
  static dbSubRefTeamStudent(refId: Expression<number>) {
    const eb = expressionBuilder<DB>();
    return jsonArrayFrom(
      eb
        .selectFrom("ref_team_student as ref_student")
        .innerJoin("student", (eb) => eb.onRef("student.id", "=", "ref_student.studentId"))
        .leftJoin("cfg_specialty as specialty", (eb) =>
          eb.onRef("specialty.id", "=", "student.specialtyId").on("specialty.doDelete", "=", 0),
        )
        .leftJoin("department", (eb) =>
          eb.onRef("department.id", "=", "student.departmentId").on("department.doDelete", "=", 0),
        )
        .leftJoin("cfg_class as class", (eb) =>
          eb.onRef("class.id", "=", "student.classId").on("class.doDelete", "=", 0),
        )
        .whereRef("ref_student.teamId", "=", refId)
        .where("ref_student.doDelete", "=", 0)
        .select(["student.id", "ref_student.isCaptain", ...this.getStudentInfoFields()])
        .orderBy("ref_student.id"),
    );
  }

  /**
   * 根据student.id的字查询，查询学生信息
   * @param id
   */
  static dbSubStudents(id: Expression<number>) {
    const eb = expressionBuilder<DB>();
    return jsonObjectFrom(
      eb
        .selectFrom("student")
        .leftJoin("cfg_specialty as specialty", (eb) =>
          eb.onRef("specialty.id", "=", "student.specialtyId").on("specialty.doDelete", "=", 0),
        )
        .leftJoin("department", (eb) =>
          eb.onRef("department.id", "=", "student.departmentId").on("department.doDelete", "=", 0),
        )
        .leftJoin("cfg_class as class", (eb) =>
          eb.onRef("class.id", "=", "student.classId").on("class.doDelete", "=", 0),
        )
        .whereRef("student.id", "=", id)
        .select(["student.id", ...this.getStudentInfoFields()]),
    );
  }

  /**
   * 根据student.id 获取学校、班级、专业、院系各个层级的信息
   * @param id
   */
  static dbSubCollegeStudent(id: Expression<number>) {
    const eb = expressionBuilder<DB>();
    return jsonObjectFrom(
      eb
        .selectFrom("student")
        .innerJoin("college", (join) =>
          join.onRef("student.collegeId", "=", "college.id").on("college.doDelete", "=", 0),
        )
        .leftJoin("cfg_specialty as specialty", (eb) =>
          eb.onRef("specialty.id", "=", "student.specialtyId").on("specialty.doDelete", "=", 0),
        )
        .leftJoin("department", (eb) =>
          eb.onRef("department.id", "=", "student.departmentId").on("department.doDelete", "=", 0),
        )
        .leftJoin("cfg_class as class", (eb) =>
          eb.onRef("class.id", "=", "student.classId").on("class.doDelete", "=", 0),
        )
        .whereRef("student.id", "=", id)
        .select(["student.id", "college.collegeName", ...this.getStudentInfoFields()]),
    );
  }
}

export class TeacherDBUtil {
  /**
   * 老师信息字段
   */
  static getCommonFields() {
    return [
      sql<string>`teacher.name`.as("name"),
      sql<string>`teacher.avatar`.as("avatar"),
      sql<number>`teacher.gender`.as("gender"),
      sql<string>`teacher.introduction`.as("introduction"),
      sql<Date | null>`teacher.birthday`.as("birthday"),
      sql<string>`teacher.employee_number`.as("employeeNumber"),
      sql<number>`teacher.teacher_experience`.as("teacherExperience"),
      sql<string>`department.department_name`.as("departmentName"),
    ];
  }

  /**
   * 根据老师id获取老师共同字段的子查询
   * @param id
   */
  static dbGetSubTeacher(id: Expression<number>) {
    const eb = expressionBuilder<DB>();
    return jsonObjectFrom(
      eb
        .selectFrom("teacher")
        .leftJoin("department", (eb) => eb.onRef("department.id", "=", "teacher.departmentId"))
        .whereRef("teacher.id", "=", id)
        .select(["teacher.id", ...this.getCommonFields()]),
    );
  }
}

export class CurriculumDBUtil {
  /**
   * 课程公共字段
   */
  static getCommonFields() {
    return [
      sql<string>`curriculum.code`.as("code"),
      sql<string>`curriculum.name`.as("name"),
      sql<string>`curriculum.cover`.as("cover"),
      sql<string>`curriculum.intro`.as("intro"),
      sql<number>`curriculum.type`.as("type"),
      sql<number>`curriculum.period_num`.as("periodNum"),
      sql<string>`curriculum.intro_video`.as("introVideo"),
    ];
  }

  /**
   * 根据课程id的子查询
   * @param id
   */
  static dbGetSubCurriculum(id: Expression<number>) {
    const eb = expressionBuilder<DB>();
    return jsonObjectFrom(
      eb
        .selectFrom("curriculum")
        .whereRef("curriculum.id", "=", id)
        .select(["curriculum.id", ...this.getCommonFields()]),
    );
  }
}
