module.exports = {
  root: true,
  parser: "@typescript-eslint/parser", // 解析器

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
  plugins: ["@typescript-eslint"],

  extends: [
    "eslint:recommended",
    "plugin:prettier/recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
  ],

  settings: {
    react: {
      pragma: "React",
      version: "detect",
    },
  },

  rules: {
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
