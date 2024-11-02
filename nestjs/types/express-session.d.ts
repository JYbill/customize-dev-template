/**
 * 扩展express-session，实现session类型自定义
 */
import session from "express-session";

/**
 * Session操作、数据的提取
 */
export type SessionType = session.Session & Partial<session.SessionData>;

export type SessionExtra = {
  startOAuthTime: string | Date | number;
  [key: string]: any;
};

declare module "express-session" {
  interface SessionData {
    [key: keyof SessionExtra]: SessionExtra[key];
  }
}

export {};
