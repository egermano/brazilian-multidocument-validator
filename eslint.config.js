import pluginJs from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ["**/*.{js,mjs,cjs,ts}"] },
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: { globals: { ...globals.node } },
  },
  {
    files: ["src/**/*.spec.ts"],
    languageOptions: { globals: { ...globals.node, ...globals.jest } },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  { ignores: ["**/jest.config.cjs", "**/coverage/*", "bin/*"] },
];
