/**
 * @Description: 注册router文件下的所有中间件
 * @Author: 小钦var
 * @Date: 2024/6/25 16:09
 */
const path = require("node:path");
const fs = require("node:fs");
const Index = require("@koa/router");

const rootRouter = new Index({
  prefix: "/api",
});

const routerFileList = fs.readdirSync(__dirname).filter((filename) => filename !== "index.js");
for (const routerFile of routerFileList) {
  const router = require(path.resolve(__dirname, routerFile));
  rootRouter.use(router.routes());
}

module.exports = rootRouter;
