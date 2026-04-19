import { defineConfig } from "oxlint";

export default defineConfig({
  categories: {
    correctness: "warn",
  },
  rules: {
    "eslint/no-unused-vars": "warn",
    "unicorn/no-empty-file":"off"
  },
});
