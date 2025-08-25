import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";
import importPlugin from "eslint-plugin-import";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: ["dist", "node_modules", ".yarn", "eslint.config.*", ".vscode", ".prettierrc"],
  },
  { files: ["**/*.{js,mjs,cjs,ts}"] },
  { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },
  { languageOptions: { globals: globals.browser } },
  {
    languageOptions: {
      parser: "@typescript-eslint/parser",
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      prettier: prettierPlugin,
      import: importPlugin,
    },
    rules: {
      "prettier/prettier": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
        },
      ],
      "import/order": [
        "warn",
        {
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },

          groups: [
            "builtin",
            "external",
            "internal",
            ["parent", "sibling"],
            "index",
            "object",
            "type",
          ],

          warnOnUnassignedImports: false,
        },
      ],
      "import/newline-after-import": ["error", { count: 1, considerComments: true }],
      "import/no-cycle": ["error", { ignoreExternal: true }],

      // Error Prevention
      "no-console": "warn",
      "no-debugger": "warn",
      "no-duplicate-imports": "error",
      "no-var": "error",

      // Best Practices
      "prefer-const": "error",
      "no-else-return": "error",
      eqeqeq: ["error", "always"],

      // Modern JavaScript
      "prefer-template": "error",
      "prefer-destructuring": [
        "error",
        {
          array: true,
          object: true,
        },
      ],
      "object-shorthand": "error",
      "import/no-absolute-path": "error",
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ...prettierConfig,
  },
];
