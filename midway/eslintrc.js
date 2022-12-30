module.exports = {
  extends: "./node_modules/mwts/",
  ignorePatterns: ["node_modules", "dist", "test", "jest.config.js", "typings"],
  env: {
    jest: true,
  },

  // 自定义少许规则
  rules: {
    quotes: ["warn", "double", { avoidEscape: true }],
    "prettier/prettier": [
      "warn",
      {
        singleQuote: false,
        printWidth: 120,
      },
    ],
    "@typescript-eslint/no-unused-vars": "off",
  },
};
