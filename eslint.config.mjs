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
      // Enforce function declarations over arrow functions for components
      "prefer-arrow-callback": "off",
      
      // Enforce explicit return types on functions
      "@typescript-eslint/explicit-function-return-type": "off",
      
      // Disallow any type
      "@typescript-eslint/no-explicit-any": "error",
      
      // Require consistent type imports
      "@typescript-eslint/consistent-type-imports": ["warn", {
        prefer: "type-imports",
        disallowTypeAnnotations: false,
      }],
      
      // Enforce naming conventions
      "@typescript-eslint/naming-convention": [
        "warn",
        {
          selector: "interface",
          format: ["PascalCase"],
        },
        {
          selector: "typeAlias",
          format: ["PascalCase"],
        },
      ],
      
      // React rules
      "react/jsx-no-leaked-render": ["warn", { validStrategies: ["ternary", "coerce"] }],
      
      // Import rules
      "import/order": ["warn", {
        groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
        "newlines-between": "never",
      }],
      
      // No console in production (allow in development)
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
];

export default eslintConfig;
