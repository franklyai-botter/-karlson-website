import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Zwischendateien von `wrangler dev`/`wrangler deploy`. Generierter Code,
    // den zu linten sinnlos ist — er erzeugte nur Rauschen im Lint-Lauf.
    ".wrangler/**",
  ]),
]);

export default eslintConfig;
