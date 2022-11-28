module.exports = {
  semi: true,
  tabWidth: 2,
  printWidth: 120,
  proseWrap: "preserve",
  singleQuote: false,
  trailingComma: "all",

  // 插件
  plugins: ["@trivago/prettier-plugin-sort-imports"],

  // prettier-plugin-sort-imports 排序import内容
  importOrder: [
    // 默认情况下，首先会放置外部依赖项
    "^react(.*)$",
    "^axios$",

    // 内部依赖
    "^@/(.*)$",
  ],
  importOrderSeparation: true, // 每个类别导入用空格区分
  importOrderSortSpecifiers: true, // 大小写排序
};
