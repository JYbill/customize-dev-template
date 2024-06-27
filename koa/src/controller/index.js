/**
 * @Description: 注册router文件下的所有中间件
 * @Date: 2024/6/25 16:09
 */
import path from "node:path";
import fs from "node:fs";
import Index from "@koa/router";
import { URL } from "node:url";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootRouter = new Index({
  prefix: "/api",
});

const routerFileList = fs.readdirSync(__dirname).filter((filename) => filename !== "index.js");
const dirURL = new URL("../controller/", import.meta.url).href;
for (const routerFile of routerFileList) {
  const fileURL = new URL(routerFile, dirURL).href;
  const { router } = await import(fileURL);
  rootRouter.use(router.routes());
}

export { rootRouter };
