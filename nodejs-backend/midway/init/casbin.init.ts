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

    const casbinAsync = [
    // 用户继承
    this.enforcer.addRoleForUser("xiaoqinvar", "MANAGER"),
    this.enforcer.addRoleForUser("MR-frog", "MANAGER"),

    // 资源继承
    this.enforcer.addNamedGroupingPolicy("g2", "/v1/casbin/users", "casbinGetApi"),
    this.enforcer.addNamedGroupingPolicy("g2", "/v1/user", "userGetApi"),
    this.enforcer.addNamedGroupingPolicy("g2", "/v1/user/verify", "userPostApi"),
    this.enforcer.addNamedGroupingPolicy("g2", "/v1/user", "userPostApi"),
    this.enforcer.addNamedGroupingPolicy("g2", "/v1/user/:id", "userPutApi"),
    this.enforcer.addNamedGroupingPolicy("g2", "/v1/user", "userDelApi"),

    // 策略p
    this.enforcer.addNamedPolicy("p", "MANAGER", "casbinGetApi", "GET"),
    this.enforcer.addNamedPolicy("p", "MANAGER", "userGetApi", "GET"),
    this.enforcer.addNamedPolicy("p", "MANAGER", "userPostApi", "POST"),
    this.enforcer.addNamedPolicy("p", "MANAGER", "userPutApi", "PUT"),
    this.enforcer.addNamedPolicy("p", "MANAGER", "userDelApi", "DELETE"),
    ];
    await Promise.all(casbinAsync);

    this.logger.info("Casbin is ready!");
  }
}
