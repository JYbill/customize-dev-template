import { defineConfig } from "oxlint";

export default defineConfig({
  env: { node: true },
  plugins: ["typescript"],
  categories: { correctness: "error" },
  options: { typeAware: true },
  rules: {
    "eslint/no-duplicate-imports": "error",
    "typescript/consistent-type-imports": "error",
    "typescript/no-unsafe-assignment": "error",
    "typescript/no-unsafe-call": "error",
    "typescript/no-unsafe-member-access": "error",
  },
});
