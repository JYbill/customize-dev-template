import "./config/env-loader.ts";
import { startHttp } from "#app/bootstrap/http.ts";

try {
  await startHttp();
} catch (error) {
  console.error("HTTP 服务启动失败", error);
  process.exitCode = 1;
}
