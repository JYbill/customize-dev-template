import Router from "@koa/router";

const router = new Router({ prefix: "/v1" });

router.get("/health", (ctx) => {
  ctx.body = { status: "ok" };
});

export { router };
