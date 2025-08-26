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
      'max-lines': ['error', {
        max: 1500,
        skipBlankLines: true,
        skipComments: true
      }],
      eqeqeq: ["error", "always"],
      "prefer-const": "off",
      "no-unneeded-ternary": "error",
      "no-duplicate-imports": ["error"],
      "no-dupe-keys": "error",
      "no-unused-vars": "off",
      "no-control-regex": "off",
      "n/no-missing-import": "off",
      "n/no-process-exit": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-misused-promises": "off",
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
