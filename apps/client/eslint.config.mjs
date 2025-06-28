import { nextJsConfig } from "@vimmer/eslint-config/next-js";

/** @type {import("eslint").Linter.Config} */
export default [
  ...nextJsConfig,
  {
    rules: {
      "react/no-children-prop": "off",
    },
  },
];
