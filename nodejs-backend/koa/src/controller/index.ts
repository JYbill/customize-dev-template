import Router from "@koa/router";

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const controllerRoot = path.dirname(fileURLToPath(import.meta.url));

function isRouteFile(filename: string): boolean {
  if (!filename.endsWith(".ts") || filename.endsWith(".d.ts") || filename === "index.ts") {
    return false;
  }
  return !/(?:\.spec|\.integration-spec|\.e2e-spec|\.otel-spec|\.llm-spec|\.test)\.ts$/.test(
    filename,
  );
}

/** 将每个一级目录注册为路由前缀，并加载其中的路由模块。 */
export async function loadRoutes(): Promise<Router> {
  const rootRouter = new Router();
  const domains = fs
    .readdirSync(controllerRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));

  for (const domain of domains) {
    const domainRouter = new Router({ prefix: "/" + domain });
    const domainPath = path.join(controllerRoot, domain);
    const routeFiles = fs
      .readdirSync(domainPath, { recursive: true })
      .filter(
        (filename): filename is string => typeof filename === "string" && isRouteFile(filename),
      )
      .sort((left, right) => left.localeCompare(right));

    for (const filename of routeFiles) {
      const url = pathToFileURL(path.join(domainPath, filename)).href;
      const { router } = (await import(url)) as { router: Router };
      domainRouter.use(router.routes());
    }
    rootRouter.use(domainRouter.routes());
  }
  return rootRouter;
}
