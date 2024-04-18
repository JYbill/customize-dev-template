export enum RedisKey {
  Register = 'register:',
  Forget = 'forget:',
}

/**
 * 角色类型
 */
export enum Role {
  ADMIN = 'admin',
  USER = 'user',
}

/**
 * 菜单类型
 */
export enum MenuTypeEnum {
  FOLDER = 1, // 一级菜单
  HREF = 2, // 链接
}

/**
 * 资源项类型
 */
export enum ReposItemEnum {
  MIX = 1,
  HREF = 2,
}

/**
 * 资源统计类型
 */
export enum StatisticsEnum {
  REPOS = 1, // 资源库
  COURSE = 2, // 课程
}

/**
 * 推荐栏目类型
 */
export enum ProgrammeEnum {
  REPOS = 1, // 资源库
  COURSE = 2, // 课程
}
