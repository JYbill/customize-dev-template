import { V1 } from "../../src/enum/index.enum";
import { UserService } from "../../src/service/user.service";

import { ILogger } from "@midwayjs/core";
import { Logger } from "@midwayjs/decorator";
import { Framework, IMidwayKoaApplication } from "@midwayjs/koa";
import { close, createApp, createHttpRequest } from "@midwayjs/mock";

describe("test/controller/user.test.ts", () => {
  let app: IMidwayKoaApplication;
  let userService: UserService;
  let logger: ILogger;
  let webToken: string;
  let freshToken: string;

  /**
   * 单元测试before执行
   */
  beforeAll(async () => {
    try {
      app = await createApp<Framework>();
      userService = await app.getApplicationContext().getAsync<UserService>(UserService);
      logger = await app.getApplicationContext().getAsync<ILogger>("logger");
    } catch (err) {
      console.error("test beforeAll error", err);
      throw err;
    }

    // 登陆操作
    const res = await createHttpRequest(app)
      .post(V1.User + "/login")
      .send({
        username: "xiaoqinvar",
        password: "123456",
      });
    const data = res.body.data;
    webToken = data.webToken;
    freshToken = data.freshToken;
    expect(res.status).toBe(200);
    expect(webToken).toBeDefined();
    expect(freshToken).toBeDefined();
  });

  afterAll(async () => {
    // close app
    await close(app);
  });

  /**
   * 登陆接口
   */
  it("should GET /v1/user/fresh", async () => {});
});
