import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

export default defineConfig({
  oxc: false, // 关闭vite 默认的编译器，默认为 esbuild，如果 vite 配置为 oxc transformer 则为 oxc transformer
  // 启用 tsconfig 别名解析
  resolve: {
    tsconfigPaths: true,
  },
  // 配置缓存目录，默认为 node_modules/.vite/apps/{package.json name}
  cacheDir: "./node_modules/.vite/app",
  plugins: [
    // 使用 vite + swc 进行编译
    swc.vite({
      swcrc: true,
      configFile: "./.swcrc",
      module: {
        type: "es6",
      },
    }),
  ],
  test: {
    // 测试环境
    environment: "node",
    // 不把 describe、it、expect、beforeEach 这些测试 API 注入成全局变量，需要显示 import 使用
    globals: false,
    // 每个测试文件运行前，先执行这个初始化文件
    setupFiles: ["test/vitest.setup.ts"],
    // 测试包含的文件
    include: [],
    // 设置 project 子项目，用来定义不同的配置
    projects: [
      {
        // 继承上面全局的配置
        extends: true,
        test: {
          name: "test",
          include: ["src/**/*.spec.ts", "src/**/*.integration-spec.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "e2e",
          include: ["test/**/*.e2e-spec.ts"],
          fileParallelism: false,
        },
      },
    ],
    // 测试结果的输出配置
    // default: 在终端里显示默认测试报告
    reporters: ["default"],
    // 测试覆盖率产物配置
    coverage: {
      provider: "v8", // 覆盖率数据采集插件
      // text: 打印到终端
      // html: 生成 html
      // json-summary：生成 coverage/coverage-summary.json 产物
      reporter: ["text", "html", "json-summary"], // 覆盖率报告样式
      reportsDirectory: "coverage", // 指定测试报告输出目录
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.d.ts", "src/library/prisma/generate/**"],
    },
  },
});
