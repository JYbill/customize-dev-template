/**
 * 扩展Request.user类型
 */
declare namespace Express {
  interface Request {
    user?: IPayload;
    pass?: boolean;
  }
}
