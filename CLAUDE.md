# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Google Apps Script (GAS) project that manages AI prompts in a Google Sheets workbook. Each prompt is stored as a row in the Prompts sheet and linked to a Google Doc for full content. An external Node.js client (`agent-client.js`) communicates with the deployed Web App endpoint.

## Deployment

This is a GAS project — there is no npm build or compile step.

- **Deploy to Google Apps Script**: `clasp push` (requires `.clasp.json` and `@google/clasp` installed)
- **Node.js client**: Copy `env.example` to `.env`, set `PROMPT_LIBRARY_WEB_APP_URL` and `PROMPT_LIBRARY_AGENT_TOKEN`, then run `node agent-client.js`

## Architecture

**13 numbered `.gs` files** with a strict load order (01 → 13). Each file depends only on files with lower numbers.

```
01_prompt_library_schema_config.gs      — Canonical schema (PROMPT_LIBRARY_SCHEMA, Object.freeze'd)
02_prompt_library_schema_service.gs     — Sheet creation, initialization, backup
03_prompt_library_document_service.gs   — Google Docs creation/update per prompt
04_prompt_library_prompt_service.gs     — Prompt CRUD, search, tags
05_prompt_library_taxonomy_service.gs   — Categories, subcategories, tags hierarchy
06_prompt_library_validation_service.gs — Integrity checks, schema validation
07_prompt_library_migration_service.gs  — Safe migration from existing workbooks
08_prompt_library_test_runner.gs        — Test suites (setup, workflow, taxonomy)
09_prompt_library_main.gs               — Menu wiring, install orchestration
10_prompt_library_strict_installer.gs   — Stop-on-error install pipeline
11_prompt_library_web_app_agent_gateway.gs — doGet/doPost Web App endpoints
12_prompt_library_menu_controller.gs    — Spreadsheet menu builder
13_schema_and_function_map_builder.gs   — Introspection/builder helpers
```

**Key structural facts:**
- Schema is the single source of truth — 5 required sheets (Prompts, Categories, Subcategories, Tags, Logs), 17 columns in Prompts
- Every prompt has a `Prompt_ID` and a linked Google Doc whose ID is stored in the sheet
- Web App gateway authenticates via a token stored in Script Properties; `healthCheck` is the only unauthenticated action
- `agent-client.js` is a thin async wrapper around the Web App HTTP API; it can also be used as a CLI (`node agent-client.js` runs the full install sequence)

## Conventions

- **Private/helper functions** are suffixed with `_()` (e.g., `normalizePromptData_()`)
- **All mutations** are logged via `logAction()` to the Logs sheet
- **Schema changes** belong exclusively in `01_prompt_library_schema_config.gs`; never hard-code sheet names or column indices elsewhere
- **Strict installer** (`10_`) halts the entire pipeline on any error — prefer `installPromptLibraryInfrastructureStrict()` over the non-strict variant
- **Locale**: Hebrew (`iw_IL`) is primary; sheet column headers and controlled-value dropdowns may appear in Hebrew

## Validation / Testing

All tests run inside the GAS runtime — trigger them from the "Prompt Library" spreadsheet menu or call directly in the GAS script editor:

| Function | Purpose |
|---|---|
| `runPromptLibrarySetupTest()` | Validates infrastructure setup |
| `runFirstStableWorkflowTest()` | End-to-end add/get/search workflow |
| `runFullIntegrityCheck()` | Full schema + data integrity check |
| `runProductionReadinessCheck()` | Pre-deployment readiness gate |

Web App actions can be tested via the Node.js client or direct HTTP calls to the deployed URL.
