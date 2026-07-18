# GitHub Quality Setup

## Files

```text
.github/workflows/code-quality.yml
.github/workflows/codeql.yml
.github/dependabot.yml
package.json
eslint.config.mjs
scripts/audit-code-advanced.js
docs/github_code_quality_agent_instructions.md
```

## Install locally

```bash
npm install
```

## Run checks

```bash
npm run check
```

## What GitHub checks automatically

| Check | Tool |
|---|---|
| JavaScript and Apps Script syntax issues | ESLint |
| Duplicate function names | custom audit script |
| Duplicate code blocks | custom audit script |
| Hardcoded token or Web App URL | custom audit script |
| Unsafe delete operations | custom audit script |
| Dependency alerts | Dependabot |
| Code security analysis | CodeQL |

## GitHub Actions

GitHub Actions workflows are YAML files stored under `.github/workflows`. The code quality workflow runs on push, pull request, and manual dispatch.
