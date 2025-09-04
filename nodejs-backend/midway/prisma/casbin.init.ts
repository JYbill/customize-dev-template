import { Inject, Logger } from "@midwayjs/decorator";
import { CasbinEnforcerService } from "@midwayjs/casbin";
import { Autoload, ILogger, Init } from "@midwayjs/core";
import { PrismaAdapter } from "casbin-prisma-adapter";
import { PrismaServiceFactory } from "../ioc/prismaFactory";

@Autoload()
export default class CasbinInit {
  @Inject()
  enforcer: CasbinEnforcerService;

  @Inject("prisma")
  prisma: PrismaServiceFactory["prisma"];

  @Logger()
  logger: ILogger;

  @Init()
  async init() {
    const adaptor = await PrismaAdapter.newAdapter(this.prisma);
    this.enforcer.setAdapter(adaptor);

    // 用户继承
    await this.enforcer.addRoleForUser("xiaoqinvar", "MANAGER");
    await this.enforcer.addRoleForUser("MR-frog", "MANAGER");

    // 资源继承
    await this.enforcer.addNamedGroupingPolicy("g2", "/v1/casbin/users", "casbinGetApi");
    await this.enforcer.addNamedGroupingPolicy("g2", "/v1/user", "userGetApi");
    await this.enforcer.addNamedGroupingPolicy("g2", "/v1/user/verify", "userPostApi");
    await this.enforcer.addNamedGroupingPolicy("g2", "/v1/user", "userPostApi");
    await this.enforcer.addNamedGroupingPolicy("g2", "/v1/user/:id", "userPutApi");
    await this.enforcer.addNamedGroupingPolicy("g2", "/v1/user", "userDelApi");

    // 策略p
    await this.enforcer.addNamedPolicy("p", "MANAGER", "casbinGetApi", "GET");
    await this.enforcer.addNamedPolicy("p", "MANAGER", "userGetApi", "GET");
    await this.enforcer.addNamedPolicy("p", "MANAGER", "userPostApi", "POST");
    await this.enforcer.addNamedPolicy("p", "MANAGER", "userPutApi", "PUT");
    await this.enforcer.addNamedPolicy("p", "MANAGER", "userDelApi", "DELETE");
    console.log(3);

    this.logger.info("Casbin is ready!");
  }
}
