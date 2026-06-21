# Antigravity Setup for Google Apps Script Code Quality

## Install

```bash
npm install
```

## Run Checks

```bash
npm run lint
npm run audit
npm run check
```

## Recommended Antigravity Workflow

1. Add or edit code.
2. Run `npm run check`.
3. Fix every ESLint error.
4. Fix every audit error.
5. Only then copy or push code to Apps Script.

## Optional Tools

Use clasp only if the project will be synced from local files to Apps Script.

```bash
npm install --save-dev @google/clasp
```

Then authenticate and connect the Apps Script project according to Google clasp documentation.
