/**
 * 扩展express-session，实现session类型自定义
 */

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
