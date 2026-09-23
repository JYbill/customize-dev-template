# Koa HTTP 技术模板

这个模板保留 Koa 应用、通用 HTTP 中间件、路由、环境配置和进程退出处理。入口不依赖数据库或其他后台服务。

## 运行环境

- Node.js 26+
- pnpm 12

## 启动

    pnpm install
    pnpm dev

默认监听 127.0.0.1:3000。访问 /api/v1/health 可得到 JSON 响应。环境变量示例位于 env/.env.example；可复制为 env/.env，再按需要设置 PORT 和 LISTEN_HOST。当前环境的 env/.development.env 或 env/.production.env 会覆盖基础文件。

## 文件职责

- src/index.ts：先加载环境变量，再启动 HTTP。
- src/config/：读取并校验监听配置。
- src/library/koa/：创建 Koa 3 应用，并启用请求级 AsyncLocalStorage。
- src/bootstrap/http.ts：装配通用中间件和路由，监听端口。
- src/bootstrap/shutdown.ts：收到 SIGINT 或 SIGTERM 后关闭 HTTP 服务。
- src/controller/index.ts：按一级目录注册路由前缀，递归加载路由模块，跳过测试文件。
- src/controller/api/v1/health.ts：无业务依赖的示例路由。
- src/middleware/：通用异常处理与请求日志。

在 Koa 中间件和路由的异步调用链中，可通过 app.currentContext 取得当前请求 Context。后台任务没有请求 Context，不应依赖该值。

## 检查

    pnpm typecheck
    pnpm lint
    pnpm format
