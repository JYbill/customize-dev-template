/**
 * @Description: 全局类型文件
 * @Author: 小钦var
 * @Date: 2023/10/24 10:42
 */
declare interface IEnv {
  DATABASE_URL: string;
  JWT_SECRET: string; // JWT 密钥
  REDIS_URL: string;
  REDIS_PWD: string;
  REFRESH_EXPIRE: string; // 刷新token
  MAIL_REGISTER_EXPIRE: number; // 邮件过期时长
  ROOT_USER: string; // root 用户名
  ROOT_PWD: string; // root 密码
  MAIL_USER: string; // 邮箱
}

declare interface IPayload {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean; // 是否是管理员
  iat: number; // 创建时间(s)
  exp: number; // 失效时间(s)
}

declare type IRefreshPayload = Omit<IPayload, 'email'>;

/**
 * 扩展Request.user类型
 */
declare namespace Express {
  export interface Request {
    user?: IPayload;
    pass?: boolean;
  }
}
