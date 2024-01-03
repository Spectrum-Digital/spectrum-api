// @ts-check
const { defineConfig } = require('eslint-define-config');

module.exports = defineConfig({
  root: true,
  env: {
    "es2021": true,
    "node": true
  },
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "plugin:prettier/recommended", "prettier"],
  plugins: ["@typescript-eslint", "unused-imports"],
  overrides: [],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  },
  rules: {
    "quotes": ["error", "single"],
    "semi": ["error", "never"],
    "unused-imports/no-unused-imports": "error",
    "prettier/prettier": ["error", { "endOfLine": "auto" }]
  }
})
