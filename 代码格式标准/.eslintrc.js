/**
 * @file: .eslintrc.js
 * @author: xiaoqinvar
 * @desc: eslint模板, eslint v9-
 * @dependencies: 
 * @date: 2022-12-31 11:06:09
 */
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser", // 解析器 @typescript-eslint/parser

  // 解析配置
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },

  // 环境
  env: {
    node: true,
    es6: true,
  },

  // 插件
  plugins: [
    // "@typescript-eslint", // 需要@typescript-eslint/eslint-plugin
    // "node", // 需要eslint-plugin-node
    // "prettier", // 需要eslint-plugin-prettier
    // "react", // 需要eslint-plugin-react
    // "sonarjs", // 需要eslint-plugin-sonarjs(代码质量)
  ],

  extends: [
    "eslint:recommended",
    // "plugin:node/recommended", // 需要eslint-plugin-node
    // "plugin:react/recommended", // 需要eslint-plugin-react
    // "plugin:@typescript-eslint/recommended", // 需要@typescript-eslint/eslint-plugin
    // "plugin:prettier/recommended", // 需要eslint-plugin-prettier
    // "plugin:sonarjs/recommended", // // 需要eslint-plugin-sonarjs(代码质量)
    // "plugin:react-hooks/recommended", // 需要eslint-plugin-react-hooks(强制react hook规则)
  ],

  settings: {
    react: {
      pragma: "React",
      version: "detect",
    },
  },

  rules: {
    eqeqeq: ["error", "always"], // 强制使用 === 和 !==
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "prettier/prettier": [
      "warn",
      {
        singleQuote: false,
        printWidth: 120,
      },
    ],
    "node/no-unpublished-import": "off",
  },
};
