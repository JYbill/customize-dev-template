
<!-- 生成：本仓库 AI 代理协作与开发指南（中文版） -->
# Copilot 指南 — customize-dev-template

目标：帮助 AI 代理和开发者快速理解本仓库结构、开发流程、约定与常见模式，提升复用效率。

## 1. 总览与架构
- 本仓库为前后端工程模板与代码片段集合，主要目录：
  - `frontend/`：多种前端模板与组件（React、Vue、Umi、小程序、uniapp）。如 `frontend/React/初始化项目模版/`，其 `package.json` 支持 craco/vite。
  - `nodejs-backend/`：后端模板（koa、express、nestjs、pm2 配置等）。如 `nodejs-backend/nestjs/` 为完整 Nest 启动模板。
  - `工具/`：通用工具函数（日期、文件、加密、OAuth、腾讯云 SDK 等），优先复用。
  - `builder/webpack模板/`：带详细注释的 webpack 配置，权威参考打包优化、分包、externals 等。
  - `docker/`：docker-compose 示例与 Dockerfile 模板，便于部署与本地多服务测试。

## 2. 常用开发流程与命令
- React 前端模板（如 `frontend/React/初始化项目模版`）：
  - 启动开发：`npm run dev` 或 `npm run start`（craco/vite）
  - 构建：`npm run build`
  - 测试：`npm run test`
- NestJS 后端模板（`nodejs-backend/nestjs`）：
  - 安装依赖：`npm install`
  - 开发模式：`npm run dev`
  - 构建：`npm run build`
  - Docker 部署：`npm run deploy:docker`（调用 `docker-build.sh`）
- 生产进程管理：后端目录下查阅 `ecosystem.config.js`（PM2 配置）。

## 3. 项目约定与模式
- 代码混用 TypeScript/JavaScript，优先用 TypeScript（如 React/Nest 模板）。
- 工具函数统一放在 `工具/`，如 `fs.util.ts`、`dateFns.util.ts`、`oauth.util.ts`，新增 util 时请遵循命名风格。
- React 输入框需保留 IME 组合输入处理（如 `frontend/React/支持输入法change的antd Input/InputEditor.tsx`、`ResWrapper.tsx`），勿随意删除。
- webpack 配置以 `builder/webpack模板/webpack.config.js` 为权威，涉及优化、externals、分包等请参考注释。

## 4. 集成点与外部依赖
- 腾讯云相关 SDK/工具在 `工具/腾讯云后台SDK工具/`、`工具/腾讯云COS存储桶/`，如需云服务集成请直接复用。
- 某些模板依赖环境变量（如 `.env` 或 `process.env`），新增服务时请保持一致。
- 多服务本地测试可用 `docker/docker-compose/` 下的 compose 文件。

## 5. 典型示例与最佳实践
- 认证/IAM 方案：见 `业务领域/IAM/`、`nodejs-backend/*/`。
- webpack 优化与分包：见 `builder/webpack模板/webpack.config.js`。
- 请求封装/接口调用：见 `axios封装/`、`frontend/React/初始化项目模版/src/service`。
- API 自动导入：见 `frontend/uniapp/uni.request网络请求封装模板/api/index.js`（require.context 自动导出）。
- NestJS 依赖注入与模块组织：见 `nodejs-backend/nestjs/src/app.module.ts`、`src/memo/*`。

## 6. 编辑与协作注意事项
- 涉及输入框 UI 时，务必保留 IME 组合输入相关处理（见 `frontend/React/*/ResWrapper.tsx`、`支持输入法change的antd Input/InputEditor.tsx`）。
- 新增工具函数请放在 `工具/`，命名风格与现有文件保持一致（如 `xxx.util.ts`）。
- 复制 `builder/webpack模板/webpack.config.js` 片段时保留注释与链接。
- 修改模板的 `package.json` 后，务必同步更新对应 README。

## 7. 禁止事项
- 禁止删除 IME 相关输入处理或输入框防护代码。
- 禁止引入重量级依赖而不更新 `package.json` 和相关 README。

如有不清楚的地方，或需补充某个模板/目录的详细说明，请告知目录或文件路径，我会补充完善本文件。
