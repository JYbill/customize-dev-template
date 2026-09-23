import Koa from "koa";

// Koa 3 将当前请求的 Context 放入自己的 AsyncLocalStorage。
const app = new Koa({ asyncLocalStorage: true });

app.on("error", (error: Error) => {
  console.error("Koa 请求处理失败", error);
});

export { app };
