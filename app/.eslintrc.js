// @see: https://eslint.org/docs/latest/use/configure/configuration-files
module.exports = {
  parserOptions: {
    ecmaVersion: "latest", // Allows the use of modern ECMAScript features
    sourceType: "module", // Allows for the use of imports
    parser: "@typescript-eslint/parser",
  },
  plugins: [
    "@typescript-eslint", // Enables eslint-plugin-typescript
  ],
  extends: ["plugin:@typescript-eslint/recommended"], // Uses the linting rules from @typescript-eslint/eslint-plugin
  env: {
    node: true, // Enable Node.js global variables
  },
  rules: {
    'no-console': 'off',
    'import/prefer-default-export': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
  },
};
