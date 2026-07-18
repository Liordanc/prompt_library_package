# Google Apps Script Code Standards

## 1. Purpose

This document defines the coding standard for the Prompt Library Google Apps Script project.

The project code MUST be production-ready before it is copied into Apps Script.

## 2. Core Rules

| Rule | Requirement |
|---|---|
| No untested code | Every new file MUST pass lint and audit checks before use |
| No silent failure | Every main function MUST handle errors or let the strict installer stop safely |
| No hidden destructive action | Code MUST NOT delete sheets, rows, files, or documents unless explicitly named as unsafe |
| No free execution gateway | Web App actions MUST pass through an allowed action list |
| No hardcoded secrets | Tokens, URLs, and secrets MUST stay in `.env` or Script Properties |
| No duplicated logic | Shared behavior MUST be moved to helper functions |
| No oversized function | A function SHOULD do one clear job |
| No vague names | Function names MUST describe the action clearly |
| No production code without logs | Main actions MUST write logs |
| No user-facing failure without message | Menu actions MUST show a readable message |

## 3. Naming Standard

| Item | Standard | Example |
|---|---|---|
| Public function | clear action name | `installPromptLibraryInfrastructureStrict` |
| Internal helper | trailing underscore | `getHeaderRow_` |
| Constant | uppercase object name | `PROMPT_LIBRARY_SCHEMA` |
| Boolean field | starts with `is` or `has` when internal | `isValid` |
| Sheet column | stable English key | `Full_Doc_Link` |
| User-facing label | Hebrew allowed | `מועדף` |

## 4. Function Structure

Each public function SHOULD follow this structure:

```javascript
function functionName(input) {
  const startedAt = new Date();

  try {
    console.log("[FunctionName] Starting");
    Logger.log("[FunctionName] Starting");

    const result = {};

    console.log("[FunctionName] Completed");
    Logger.log("[FunctionName] Completed");

    return {
      ok: true,
      result
    };
  } catch (error) {
    console.error("[FunctionName] Failed: " + error.message);
    Logger.log("[FunctionName] Failed: " + error.message);
    throw error;
  }
}
```

## 5. Error Handling

Every main action MUST satisfy at least one of these:

| Pattern | Use Case |
|---|---|
| `try/catch` with `logError` | menu actions, gateway actions, install steps |
| strict throw | helper functions where caller handles the error |
| structured result `{ ok: false }` | validation functions |

Do not hide errors with empty `catch`.

Forbidden:

```javascript
try {
  doSomething();
} catch (e) {}
```

Allowed:

```javascript
try {
  doSomething();
} catch (error) {
  logError("ACTION_FAILED", "Entity", id, error.message);
  throw error;
}
```

## 6. Logging Standard

Every main action MUST log:

| Event | Required Log |
|---|---|
| Start | `console.log` and `Logger.log` |
| Success | `logAction` when available |
| Failure | `logError` when available |
| Menu result | user alert or readable result |
| Gateway result | JSON response |

## 7. Hebrew Comments

Comments SHOULD be in Hebrew when they explain project logic.

Allowed English comments:

| Case | Allowed |
|---|---|
| Third-party technical term | Yes |
| Standard code annotation | Yes |
| API-specific note | Yes |

Preferred:

```javascript
// בודק שכל גיליונות החובה קיימים לפני שממשיכים להתקנה.
```

Not preferred:

```javascript
// Checks required sheets.
```

## 8. DRY Rules

Repeated logic MUST be extracted when it appears more than twice.

Examples:

| Repeated Logic | Helper |
|---|---|
| Read header row | `getHeaderRow_` |
| Convert row to object | `objectFromHeaders_` |
| Write log | `logAction` |
| Build JSON response | `jsonResponse_` |
| Validate required value | `requiredValue_` |

## 9. KISS Rules

Code SHOULD use the simplest reliable structure.

Avoid:

- generic frameworks inside Apps Script
- deep inheritance
- unclear abstractions
- hidden side effects
- functions that both validate, create, migrate, and report

Prefer:

- small functions
- explicit action names
- direct validation
- simple objects
- predictable return values

## 10. Production Readiness Rules

A file is not production-ready unless:

| Check | Required Result |
|---|---|
| ESLint passes | Yes |
| Code audit passes | Yes |
| No duplicate function names | Yes |
| No hardcoded token | Yes |
| No empty catch block | Yes |
| Main functions log actions | Yes |
| Gateway actions are allowlisted | Yes |
| Destructive functions are clearly marked | Yes |
| User-facing menu actions return readable messages | Yes |

## 11. Required Local Commands

```bash
npm install
npm run lint
npm run audit
npm run check
```

## 12. Stop Conditions

Stop and fix before deployment when:

| Condition |
|---|
| ESLint reports errors |
| Audit reports duplicate function names |
| Audit finds hardcoded token-like values |
| Audit finds empty catch blocks |
| Audit finds forbidden delete operations |
| Audit finds gateway action without allowlist |
| Any install or validation function returns `ok=false` |
