/**
 * @file: index.ts
 * @author: xiaoqinvar
 * @desc：区分环境文件
 * @date: 2022-10-29 12:32:17
 */
import { BASE_UEL, DEV_URL, TIME_OUT } from "./config/config.request";
import AxiosRequest from "./request/axios.request";

// 环境区分接口
let Request: AxiosRequest;
if (import.meta.env.MODE === "development") {
  Request = new AxiosRequest({
    baseURL: DEV_URL,
    timeout: TIME_OUT,
  });
} else {
  Request = new AxiosRequest({
    baseURL: BASE_UEL,
    timeout: TIME_OUT,
  });
}

export {
  Request
}
