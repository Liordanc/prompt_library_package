import js from "@eslint/js";
import globals from "globals";

const gasGlobals = {
  SpreadsheetApp: "readonly",
  DocumentApp: "readonly",
  DriveApp: "readonly",
  PropertiesService: "readonly",
  ContentService: "readonly",
  Utilities: "readonly",
  Logger: "readonly",
  Session: "readonly",
  ScriptApp: "readonly",
  HtmlService: "readonly",
  UrlFetchApp: "readonly",
  GmailApp: "readonly",
  CalendarApp: "readonly"
};

export default [
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      ".clasp.json"
    ]
  },
  js.configs.recommended,
  {
    files: ["**/*.js", "**/*.gs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script",
      globals: {
        ...globals.es2021,
        ...globals.node,
        ...gasGlobals
      }
    },
    rules: {
      "no-unused-vars": ["error", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }],
      "no-undef": "error",
      "no-redeclare": "error",
      "no-dupe-keys": "error",
      "no-duplicate-case": "error",
      "no-empty": ["error", { "allowEmptyCatch": false }],
      "no-console": "off",
      "prefer-const": "error",
      "eqeqeq": ["error", "always"],
      "curly": ["error", "all"],
      "no-var": "error",
      "complexity": ["warn", 12],
      "max-depth": ["warn", 4],
      "max-params": ["warn", 5],
      "max-lines-per-function": ["warn", {
        "max": 120,
        "skipBlankLines": true,
        "skipComments": true
      }]
    }
  }
];
