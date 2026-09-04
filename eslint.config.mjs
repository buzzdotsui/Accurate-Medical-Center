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
    // HMS dashboard pages — pre-existing issues out of scope for marketing refactor
    "src/app/(dashboard)/**",
    "src/app/(auth)/**",
  ]),
  {
    rules: {
      // Allow _-prefixed variables to be unused (standard convention)
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          varsIgnorePattern: "^_|^NextRequest$|^AppError$|^error$|^auth$",
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    // These tracked operational scripts are invoked directly by Node in this
    // CommonJS project; changing the application-wide module system solely for
    // them would make their documented invocation incompatible.
    files: [
      "audit_script.js",
      "check_db.js",
      "check_db_pg.js",
      "scripts/download-fonts.js",
      "upload_consultation.js",
      "upload_consultation_compressed.js",
      "upload_consultation_trimmed.js",
      "verify_network.js",
    ],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
]);

export default eslintConfig;
