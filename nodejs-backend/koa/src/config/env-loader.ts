import dotenv from "@dotenvx/dotenvx";

import path from "node:path";
import { fileURLToPath } from "node:url";

const envDir = fileURLToPath(new URL("../../env/", import.meta.url));

// 基础环境文件先加载，当前环境文件可覆盖同名配置。
dotenv.config({
  path: [
    path.join(envDir, ".env"),
    path.join(envDir, "." + (process.env.NODE_ENV ?? "development") + ".env"),
  ],
  overload: true,
  strict: true,
  logLevel: "error",
  ignore: ["MISSING_ENV_FILE"],
});
