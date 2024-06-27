// 读取环境变量
import path from "node:path";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: [
    // 数组元素越靠前，优先级最高
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, ".production.env")
      : path.resolve(__dirname, ".development.env"),
    path.resolve(__dirname, ".env"),
  ],
});
