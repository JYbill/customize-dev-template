export default {
  plugins: ["@trivago/prettier-plugin-sort-imports"],
  importOrderSeparation: true, // 导入种类用空行分隔
  importOrderSortSpecifiers: true, // 大小写排序
  importOrderParserPlugins: ["classProperties"],
  importOrder: [
    "./config/env-loader.js", // ESM下使用dotenv加载环境变量必须放在首位
    "#config",
    "^@koa",
    "^koa",
    "^node:(.*)$",
    "^#",
    "^[./]",
  ],

  semi: true,
  tabWidth: 2,
  printWidth: 80,
  proseWrap: "preserve",
  singleQuote: false,
  trailingComma: "all",
};
