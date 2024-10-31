/**
 * @Description: 全局类型文件
 * @Author: 小钦var
 * @Date: 2023/10/24 10:42
 */
declare global {
  declare interface IEnv {
    // 一般写死的
    PORT: number;
  }

  declare interface IPayload {
    id: number;
    name: string;
    email: string;
    isAdmin: boolean; // 是否是管理员
    iat: number; // 创建时间(s)
    exp: number; // 失效时间(s)
  }
}

export {};
