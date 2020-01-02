module.exports = {
  parser: "@typescript-eslint/parser",
  env: {
    browser: true,
    node: true
  },
  plugins: ["@typescript-eslint"],
  parserOptions: {
    project: ["./tsconfig.json"],
    tsconfigRootDir: "./",
    createDefaultProgram: true
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ],
  rules: {
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/camelcase": "off",
    "no-constant-condition": "off",
    "@typescript-eslint/no-misused-promises": [
      "error",
      {
        checksVoidReturn: false
      }
    ]
  }
};
