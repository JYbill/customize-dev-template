/**
 * @file: entire.ts
 * @author: xiaoqinvar
 * @desc：entire 接口例子🌰
 * @date: 2022-10-29 13:04:43
 */
import { Request } from '@/api';
import type { InternalAxiosRequestConfig } from 'axios'

interface IList {
  offset: number;
  size: number;
}

interface IHomeData {
  errCode: number;
  list: any[];
  totalCount: number;
}

export async function list(listParam: IList) {
  try {
    return await Request.get<IHomeData>("/entire/list", {
      params: listParam,
    });
  } catch (error: unknown) {
    console.error("entries.ts#list", error);
    return null;
  }
}

export async function listTestMethodAOP(listParam: IList) {
  try {
    return await Request.request<IHomeData>({
      url: "/entire/list",
      params: listParam,
      interceptor: {
        reqSuccessHandler(config) {
          console.log("方法级别请求成功拦截器");
          return config as InternalAxiosRequestConfig;
        },
        resSuccessHandler(res) {
          console.log("方法级别响应成功拦截器");
          return res;
        },
        resFailHandler(error) {
          console.log("方法级别响应失败拦截器");
          return error;
        },
      },
    });
  } catch (error: unknown) {
    console.error("entries.ts#listTest", error);
    return null;
  }
}
