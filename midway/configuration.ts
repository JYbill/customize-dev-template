import { DefaultErrorFilter } from "./filter/default.filter";
import { NotFoundFilter } from "./filter/notfound.filter";
import UnAuthorizedFilter from "./filter/unauthorized.filter";
import { JwtPassportMiddleware } from "./middleware/jwt.middleware";
import { ReportMiddleware } from "./middleware/report.middleware";
import { ResponseMiddleware } from "./middleware/response.middleware";
import * as dotenv from "dotenv";
import { join } from "path";

import * as casbin from "@midwayjs/casbin";
import { App, Configuration } from "@midwayjs/decorator";
import * as info from "@midwayjs/info";
import * as jwt from "@midwayjs/jwt";
import * as koa from "@midwayjs/koa";
import * as passport from "@midwayjs/passport";
import * as validate from "@midwayjs/validate";

dotenv.config();

@Configuration({
  imports: [
    koa,
    jwt,
    validate,
    passport,
    casbin,
    {
      component: info,
      enabledEnvironment: ["local"],
    },
  ],
  importConfigs: [join(__dirname, "./config")],
})
export class ContainerLifeCycle {
  @App()
  app: koa.Application;

  async onReady() {
    // add middleware
    this.app.useMiddleware([ResponseMiddleware, ReportMiddleware, JwtPassportMiddleware]);
    // add filter
    this.app.useFilter([UnAuthorizedFilter, NotFoundFilter, DefaultErrorFilter]);
  }
}
