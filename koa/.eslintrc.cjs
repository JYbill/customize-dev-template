module.exports = {
  root: true,
  env: {
    node: true,
    es6: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:prettier/recommended",
    "plugin:n/recommended",
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {
    "no-duplicate-imports": ["error"], // 不允许重复导入相同的模块
    "no-unused-vars": "off",
    "n/file-extension-in-import": ["error", "always"], // 导入相对路径的文件必须指明扩展名
  },
};
