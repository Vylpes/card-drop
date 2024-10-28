import js from "@eslint/js";
import ts from "typescript-eslint";

export default [
    {
        ignores: [
            "**/dist/",
            "eslint.config.mjs",
            "jest.config.cjs",
            "jest.setup.js",
            "**/.temp/**/*"
        ],
    },
    js.configs.recommended,
    ...ts.configs.recommended,
    {
        languageOptions: {
            globals: {
                exports: "writable",
                module: "writable",
                require: "writable",
                process: "writable",
                console: "writable",
                jest: "writable",
            },
    
            ecmaVersion: 6,
            sourceType: "script",
        },
    
        files: [
            "./src",
            "./tests"
        ],
    
        rules: {
            camelcase: "error",
            "brace-style": ["error", "1tbs"],
            "comma-dangle": ["error", "never"],
    
            "comma-spacing": ["error", {
                before: false,
                after: true,
            }],
    
            "comma-style": ["error", "last"],
            "arrow-body-style": ["error", "as-needed"],
            "arrow-parens": ["error", "as-needed"],
            "arrow-spacing": "error",
            "no-var": "error",
            "prefer-template": "error",
            "prefer-const": "error",
        },
    }
];
