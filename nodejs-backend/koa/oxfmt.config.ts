import { defineConfig } from "oxfmt";

export default defineConfig({
  semi: true,
  tabWidth: 2,
  printWidth: 100,
  singleQuote: false,
  trailingComma: "all",
  sortPackageJson: false,
  sortImports: {
    customGroups: [
      { groupName: "env-loader", elementNamePattern: ["./config/env-loader.ts"] },
      { groupName: "koa-scoped", elementNamePattern: ["@koa/**"] },
      { groupName: "koa", elementNamePattern: ["koa*"] },
    ],
    groups: [
      "env-loader",
      "koa-scoped",
      "koa",
      "external",
      "builtin",
      ["internal", "subpath"],
      ["parent", "sibling", "index"],
      "style",
      "unknown",
    ],
    internalPattern: ["#*"],
    newlinesBetween: true,
  },
});
