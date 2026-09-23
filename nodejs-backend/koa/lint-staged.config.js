export default {
  "*.{ts,cts,mts}": [
    "oxlint --config oxlint.config.ts --fix --no-error-on-unmatched-pattern",
    "oxfmt --config oxfmt.config.ts",
  ],
};
