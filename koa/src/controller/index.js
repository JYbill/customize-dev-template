/**
 * @Description: 注册router文件下的所有中间件
 * @Date: 2024/6/25 16:09
 */
import Router from "@koa/router";

import fs from "node:fs";
import path from "node:path";
import { URL, fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 将第一层目录设置为api路径前缀，并将子路径挂载到对应前缀下
 * @example
 * ```ts
 * --api
 *    --v1
 *       --test.js(/v1/test/content, /v1/test/txt)
 * --wechat-api
 *    --v1
 *       --test.js(/v1/test/test1)
 * routerImportHandler("api") // 生成 /api/v1/test/content, /api/v1/test/txt
 * routerImportHandler("wechat-api") // 生成 /wechat-api/v1/test/test1
 * ```
 * @param dirname
 * @return {Promise<Router>}
 */
async function routerImportHandler(dirname) {
  const dirRouter = new Router({
    prefix: `/${dirname}`,
  });
  const dirPath = path.resolve(__dirname, dirname);
  const routerFileList = fs
    .readdirSync(dirPath, { recursive: true })
    .filter((filename) => filename.endsWith(".js"));
  const dirURL = new URL(`../controller/${dirname}/`, import.meta.url).href;
  for (const routerFile of routerFileList) {
    const fileURL = new URL(routerFile, dirURL).href;
    // console.log("fileURL", fileURL);
    const { router } = await import(fileURL);
    dirRouter.use(router.routes());
  }
  return dirRouter;
}

const rootRouter = new Router({ prefix: "" });
const dirnameList = fs
  .readdirSync(__dirname)
  .filter((filename) => !filename.includes(".js"));
for (const dirname of dirnameList) {
  const dirRouter = await routerImportHandler(dirname);
  rootRouter.use(dirRouter.routes());
}
export { rootRouter };
