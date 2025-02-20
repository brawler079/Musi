import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "off", // Ignore unused variables
      "@typescript-eslint/ban-ts-comment": "off", // Allow @ts-ignore
      "@typescript-eslint/no-explicit-any": "off", // Allow 'any' type
      "react-hooks/exhaustive-deps": "warn", // Warn instead of error for missing deps
    },
  },
];

export default eslintConfig;
