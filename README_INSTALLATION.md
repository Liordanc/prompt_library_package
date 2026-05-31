# Prompt Library — Installation Runbook

## Prerequisites

- Google account with access to Google Sheets, Docs, and Drive
- `@google/clasp` installed: `npm install -g @google/clasp`
- `.clasp.json` configured for the target GAS project
- A Google Spreadsheet named `prompts Library`

---

## Step 1 — Push code to Google Apps Script

```bash
clasp push
```

All 13 `.gs` files and the 2 HTML sidebar files will be uploaded.

---

## Step 2 — Run the full setup sequence

Open the Spreadsheet → menu **Prompt Library → Run Full Setup Sequence**.

This runs in order:
1. Creates / resets agent token
2. `installPromptLibraryInfrastructureStrict()` — creates all sheets and columns
3. `runPromptLibrarySetupTest()` — validates infrastructure
4. `runFirstStableWorkflowTest()` — creates a test prompt end-to-end
5. `runFullIntegrityCheck()` — validates schema and data
6. `runProductionReadinessCheck()` — final gate

**Expected result:** all steps `ok = true`. If any step fails, the sequence stops and shows the error.

Alternatively, run each step manually from the GAS editor:

```javascript
installPromptLibraryInfrastructureStrict();
runPromptLibrarySetupTest();
runFirstStableWorkflowTest();
runFullIntegrityCheck();
runProductionReadinessCheck();  // must return ok === true
```

---

## Step 3 — Deploy the Web App

In the GAS editor: **Deploy → New deployment → Web App**

- Execute as: **Me**
- Who has access: **Anyone** (or restrict as needed)
- Copy the deployment URL

---

## Step 4 — Configure the Node.js client

```bash
cp env.example .env
```

Edit `.env`:

```
PROMPT_LIBRARY_WEB_APP_URL=<deployment URL from Step 3>
PROMPT_LIBRARY_AGENT_TOKEN=<token shown after Step 2>
```

Test the connection:

```bash
node -e "require('./agent-client').healthCheck().then(console.log)"
```

Expected: `{ status: 'ok', ... }`

---

## Step 5 — Completion criteria

The installation is complete when **all** of the following are true:

1. `runProductionReadinessCheck().ok === true`
2. Spreadsheet menu **Prompt Library** appears after reload
3. Logs sheet has no Error entries
4. `healthCheck` via Node.js client returns `ok`

---

## Required files (13 .gs + 2 HTML)

```
01_prompt_library_schema_config.gs
02_prompt_library_schema_service.gs
03_prompt_library_document_service.gs
04_prompt_library_prompt_service.gs
05_prompt_library_taxonomy_service.gs
06_prompt_library_validation_service.gs
07_prompt_library_migration_service.gs
08_prompt_library_test_runner.gs
09_prompt_library_main.gs
10_prompt_library_strict_installer.gs
11_prompt_library_web_app_agent_gateway.gs
12_prompt_library_menu_controller.gs
13_schema_and_function_map_builder.gs
prompt_library_sidebar.html
prompt_library_import_sidebar.html
```

---

## Schema version

Current: **1.1.0** — 8 sheets, 21 columns in Prompts, 28 Web App actions.
