module.exports = {
  ...require("mwts/.prettierrc.json"),
  singleQuote: false,
  printWidth: 120,

  // 插件
  plugins: ["@trivago/prettier-plugin-sort-imports"],
  importOrderParserPlugins : ["typescript", "classProperties", "decorators-legacy"],

  // prettier-plugin-sort-imports 排序import内容
  importOrder: ["^@midwayjs(.*)$"],
  importOrderSeparation: true, // 每个类别导入用空格区分
  importOrderSortSpecifiers: true, // 大小写排序
};
