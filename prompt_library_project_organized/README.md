# Prompt Library Project

## Folder Structure

```text
prompt_library_project_organized/
├─ source/
│  └─ Google Apps Script files to copy into Apps Script
├─ docs/
│  └─ documentation, manifests, agent instructions
├─ agent/
│  └─ Node.js client and environment example for external agent use
├─ quality/
│  └─ local quality tools, ESLint, audit scripts, GitHub quality setup
└─ .github/
   └─ workflows for GitHub Actions
```

## Apps Script Install Order

Copy the files from `source/` into the Apps Script project in numeric order.

Expected order:

```text
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
```

## First Functions To Run

```javascript
installPromptLibraryInfrastructureStrict();
createSchemaAndFunctionMapSheets();
runPromptLibrarySetupTest();
runFirstStableWorkflowTest();
runProductionReadinessCheck();
```

## Web App Agent

Use files in `agent/`.

Copy `.env.example` to `.env` and fill:

```text
PROMPT_LIBRARY_WEB_APP_URL=
PROMPT_LIBRARY_AGENT_TOKEN=
```

## GitHub Quality

Use the files under `quality/` and `.github/`.

Recommended commands:

```bash
npm install
npm run check
```

## Production Rule

Do not deploy or copy code into Apps Script until the quality checks pass.
