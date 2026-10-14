import js from "@eslint/js";
import tseslint from "typescript-eslint";
import next from "eslint-config-next/core-web-vitals";
export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.next/**",
      "**/next-env.d.ts",
      "**/.turbo/**",
      "garant-mvp-spec/**",
    ],
  },
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  ...next.map((config) => ({ ...config, files: ["apps/web/**/*.{ts,tsx}"] })),
  {files:["apps/web/**/*.{ts,tsx}"],settings:{next:{rootDir:"apps/web/"}}},
  {
    files: ["**/*.mjs"],
    ...js.configs.recommended,
    languageOptions: { globals: { process: "readonly" } },
  },
];
