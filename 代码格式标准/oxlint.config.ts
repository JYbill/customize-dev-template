import { defineConfig } from "oxlint";

export default defineConfig({
  env: {
    // 运行环境，对于一些全局变量 oxlint 会认为合法
    node: true
  },
  // typescript 需要安装 oxlint-tsgolint
  // node 无需插件无需安装包
  plugins: ["typescript", "node"],
  categories: {
    // 检查明显可能出错的代码，例如不可达代码、重复条件、错误的比较、Promise 使用问题等。它是一个规则集合就叫做correctness
    correctness: "error",
  },
  ignorePatterns: ["**/*.d.ts"],
  options: {
    // 开启类型感知lint，结合 typescript 插件进行处理
    typeAware: true,
  },
  rules: {
    "typescript/ban-ts-comment": "off",
    "no-unused-vars": [
      "error",
      {
        fix: {
          // safe-fix、suggestion
          /*
          ┌───────────────┬────────────┬───────────────────┬───────────────────┐
          │   修复类型    │ 普通 --fix │ --fix-suggestions │ --fix-dangerously │
          ├───────────────┼────────────┼───────────────────┼───────────────────┤
          │ safe-fix      │ 会应用     │ 不会应用          │ 会应用            │
          ├───────────────┼────────────┼───────────────────┼───────────────────┤
          │ suggestion    │ 不会应用   │ 会应用            │ 会应用            │
          ├───────────────┼────────────┼───────────────────┼───────────────────┤
          │ dangerous fix │ 不会应用   │ 不会应用          │ 会应用            │
          └───────────────┴────────────┴───────────────────┴───────────────────┘
          */
          imports: "safe-fix", // 设置导入未使用规则使用 safe-fix 模式
          variables: "safe-fix",
          // 忽略未使用的函数参数
          argsIgnorePattern: "^_",
          // 忽略普通变量
          varsIgnorePattern: "^_",
          // 忽略 catch (_err)
          caughtErrorsIgnorePattern: "^_",
          // 忽略数组解构里的下划线变量
          destructuredArrayIgnorePattern: "^_",
        },
      },
    ],
  },
});
