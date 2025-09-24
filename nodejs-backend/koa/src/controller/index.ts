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

export class RootRouterLoader {
  private readonly rootRouter = new Router({ prefix: "" });

  get router() {
    return this.rootRouter;
  }

  /**
   * 将第一层目录设置为api路径前缀(⚠️ 只做到了第一层，方便自定义路由)，并将子路径挂载到对应前缀下
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
   */
  private async routerImportHandler(dirname: string) {
    const dirRouter = new Router({
      prefix: `/${dirname}`,
    });
    const dirPath = path.resolve(__dirname, dirname);
    const routerFileList = fs.readdirSync(dirPath, { recursive: true }).filter((filename) => {
      // console.log(filename); // DEBUG
      if (typeof filename !== "string") return false;
      return !["index.ts", ".DS_Store"].includes(filename) && filename.endsWith(".ts");
    });
    const dirURL = new URL(`../controller/${dirname}/`, import.meta.url).href;
    for (const routerFile of routerFileList) {
      const fileURL = new URL(routerFile, dirURL).href;
      // console.log("fileURL", fileURL); // DEBUG
      const { router } = (await import(fileURL)) as { router: Router };
      dirRouter.use(router.routes());
    }
    return dirRouter;
  }

  async load() {
    const dirnameList = fs
      .readdirSync(__dirname)
      .filter(
        (filename) =>
          !filename.includes(".ts") &&
          ![".DS_Store", "validator", "router-handler"].includes(filename),
      );
    // DEBUG
    /*rootRouter.stack.forEach((item) => {
      if (item.path.includes("v1")) {
        console.log(item);
      }
    });*/
    for (const dirname of dirnameList) {
      const dirRouter = await this.routerImportHandler(dirname);
      this.rootRouter.use(dirRouter.routes());
    }
  }
}
