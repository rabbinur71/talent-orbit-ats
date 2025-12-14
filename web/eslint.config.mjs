import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig([
  ...nextVitals,
  ...nextTs,

  // Only apply type-aware parsing to TS files
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ["./tsconfig.json"],
      },
    },
  },

  // Ensure config files are NOT type-checked by TS parser
  {
    files: ["**/*.{js,cjs,mjs}"],
    languageOptions: {
      parserOptions: {
        project: null,
      },
    },
  },

  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
