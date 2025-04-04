import { HttpException } from "@nestjs/common";

/**
 * 数据库异常类
 */
export class DBExpectation extends HttpException {
  constructor(msg = "查询数据库异常") {
    super(msg, 500);
  }
}

export class RedisExpectation extends HttpException {
  constructor(msg = "Redis异常") {
    super(msg, 500);
  }
}

/**
 * 项目异常类
 */
export class ProjectException extends HttpException {}

/**
 * 用户已存在异常
 */
export class UserExistException extends ProjectException {
  constructor() {
    super("用户已存在", 400);
  }
}

export class ParamsMissedException extends ProjectException {
  constructor(msg = "参数缺失") {
    super(msg, 400);
  }
}

export class ParamsErrorException extends ProjectException {
  constructor(msg = "参数错误") {
    super(msg, 400);
  }
}

/**
 * 登录异常
 */
export class LoginException extends ProjectException {
  constructor(msg = "账号密码不正确") {
    super(msg, 400);
  }
}

export class LogoutException extends ProjectException {
  constructor(msg = "退出失败") {
    super(msg, 400);
  }
}

/**
 * JWT Token异常
 */
export class TokenMissed extends ProjectException {
  constructor(msg = "Token缺失") {
    super(msg, 403);
  }
}

export class TokenException extends ProjectException {
  constructor(msg = "请勿伪造不合法的JWT Token") {
    super(msg, 403);
  }
}

/**
 * 无权限异常
 */
export class AuthDenied extends ProjectException {
  constructor(msg = "无权限") {
    super(msg, 403);
  }
}

/**
 * 数据库不存在对应数据异常
 */
export class NOExistException extends ProjectException {
  constructor(msg = "DB不存在数据") {
    super(msg, 400);
  }
}
