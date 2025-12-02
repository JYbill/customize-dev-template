/**
 * @file: eslint.config.js
 * @author: xiaoqinvar
 * @desc: 最新版本的eslint模板
 * @dependencies: 
 * @date: 2025-08-26 14:41:53
 */
import eslintJS from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import eslintPluginN from "eslint-plugin-n";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import tsESLint from "typescript-eslint";
import globals from "globals";
import unusedImports from "eslint-plugin-unused-imports";

export default tsESLint.config([
  eslintJS.configs.recommended,
  eslintPluginN.configs["flat/recommended-module"],
  eslintPluginPrettier,
  eslintConfigPrettier,
  {
    plugins: {
      "unused-imports": unusedImports,
    },
  },
  ...tsESLint.configs.recommendedTypeCheckedOnly,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // eslint
      "max-lines": [
        "error",
        {
          max: 1500,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      eqeqeq: ["error", "always"], // 强制使用===
      "no-unneeded-ternary": "error", // 禁用不必要的三元运算符
      "no-duplicate-imports": ["error"], // 禁用重复导入
      "no-dupe-keys": "error", // 禁止对象字面量中出现重复的键
      "no-control-regex": "off", // 允许正则表达式中的控制字符

      // typescript-eslint
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off", // 允许显示any
      "@typescript-eslint/consistent-type-imports": "error", // 类型导入必须使用type关键字
      "@typescript-eslint/no-misused-promises": "off", // 允许适合的地方使用promise

      // n
      "n/no-missing-import": "off",
      "n/no-process-exit": "off",

      // unused-imports
      "unused-imports/no-unused-imports": "warn",
      "unused-imports/no-unused-vars": "off",
      // 技术债
      "@typescript-eslint/no-unsafe-assignment": "warn",
      "@typescript-eslint/no-unsafe-member-access": "warn",
      "@typescript-eslint/no-unsafe-argument": "warn",
      "@typescript-eslint/no-unsafe-return": "warn",
      "@typescript-eslint/no-unsafe-call": "warn",
      "@typescript-eslint/no-for-in-array": "warn"
    },
  },
  {
    ignores: [
      "*.cjs",
      "*.js",
      "*.mjs",
    ]
  }
]);
