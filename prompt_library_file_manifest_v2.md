# Prompt Library File Manifest v2

## 1. Apps Script Files

| Order | File Name | Type | Purpose |
|---:|---|---|---|
| 01 | 01_prompt_library_schema_config.gs | Config | Canonical schema configuration (v1.1.0) |
| 02 | 02_prompt_library_schema_service.gs | Service | Sheet creation, schema initialization, logs |
| 03 | 03_prompt_library_document_service.gs | Service | Google Docs creation and update |
| 04 | 04_prompt_library_prompt_service.gs | Service | Prompt CRUD, search, tags, templates, versioning, export/import, rating |
| 05 | 05_prompt_library_taxonomy_service.gs | Service | Categories, subcategories, tags |
| 06 | 06_prompt_library_validation_service.gs | Service | Integrity checks and validation |
| 07 | 07_prompt_library_migration_service.gs | Service | Safe migration from existing workbook |
| 08 | 08_prompt_library_test_runner.gs | Test | Setup, workflow, taxonomy, template, versioning tests |
| 09 | 09_prompt_library_main.gs | Main | Menu, install functions, orchestration |
| 10 | 10_prompt_library_strict_installer.gs | Installer | Strict installation pipeline with stop-on-error behavior |
| 11 | 11_prompt_library_web_app_agent_gateway.gs | Gateway | Web App endpoint for external agent operations (28 allowed actions) |
| 12 | 12_prompt_library_menu_controller.gs | UI | Spreadsheet menu builder + sidebar launchers |
| 13 | 13_schema_and_function_map_builder.gs | Builder | Introspection and function map builder |

## 2. Required Load Order

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

## 3. Dependency Map

| File | Depends On |
|---|---|
| 01_prompt_library_schema_config.gs | None |
| 02_prompt_library_schema_service.gs | 01 |
| 03_prompt_library_document_service.gs | 01, 02 |
| 04_prompt_library_prompt_service.gs | 01, 02, 03 |
| 05_prompt_library_taxonomy_service.gs | 01, 02, 04 |
| 06_prompt_library_validation_service.gs | 01, 02, 03, 04, 05 |
| 07_prompt_library_migration_service.gs | 01, 02, 04, 05, 06 |
| 08_prompt_library_test_runner.gs | 01, 02, 03, 04, 05, 06, 07 |
| 09_prompt_library_main.gs | 01, 02, 03, 04, 05, 06, 07, 08 |
| 10_prompt_library_strict_installer.gs | 01, 02, 06 |
| 11_prompt_library_web_app_agent_gateway.gs | 01, 02, 03, 04, 05, 06, 07, 08, 09, 10 |
| 12_prompt_library_menu_controller.gs | 04, 05, 10, 11 |
| 13_schema_and_function_map_builder.gs | 01 |

## 4. HTML Files

| File | Purpose |
|---|---|
| prompt_library_sidebar.html | Sidebar UI — Add New Prompt form |
| prompt_library_import_sidebar.html | Sidebar UI — Import Prompts from JSON |

## 5. Public Entry Points

| Function | File | Purpose |
|---|---|---|
| installPromptLibraryInfrastructure() | 09 | Full infrastructure installation |
| installPromptLibraryInfrastructureStrict() | 10 | Strict installation with stop-on-error behavior |
| initializePromptLibrary() | 02 | Create and verify required sheets |
| addPrompt(promptData) | 04 | Add one prompt and create linked document |
| updatePromptContent(promptId, updates, changeSummary) | 04 | Update prompt content with version snapshot |
| getPromptRecordById(promptId) | 04 | Get a single prompt record |
| findPromptRecords(query) | 04 | Search prompts by text |
| archivePrompt(promptId) | 04 | Archive a prompt |
| markPromptFavorite / unmarkPromptFavorite / togglePromptFavorite | 04 | Manage favorites |
| fillTemplate(promptId, valuesMap) | 04 | Fill {{variable}} placeholders |
| getTemplateVariables(promptId) | 04 | Get variable definitions for a template |
| getPromptHistory(promptId) | 04 | Get version history snapshots |
| ratePrompt(promptId, rating) | 04 | Rate a prompt (1–5) |
| recordPromptUsage(promptId) | 04 | Increment use count + set last used |
| getTopRatedPrompts(limit) | 04 | Top N prompts by rating |
| getMostUsedPrompts(limit) | 04 | Top N most used prompts |
| getRecentlyUsedPrompts(limit) | 04 | N most recently used prompts |
| exportPromptsToJson(includeArchived) | 04 | Export prompts to Google Doc (JSON) |
| importPromptsFromJson(jsonString) | 04 | Import prompts from JSON array |
| doPost(e) | 11 | Web App action execution endpoint |
| doGet(e) | 11 | Web App health check endpoint |
| setAgentGatewayToken(token) | 11 | Store Web App agent token in script properties |
| runPromptLibrarySetupTest() | 08 | Validate setup |
| runFirstStableWorkflowTest() | 09 | Validate first working flow |
| runFullIntegrityCheck() | 06 | Run full validation |
| runProductionReadinessCheck() | 09 | Final readiness check |
| inspectExistingWorkbook() | 07 | Inspect current workbook state |
| buildMigrationReport() | 07 | Generate migration report |

## 6. Internal Helper Naming Convention

Internal helper functions MUST end with underscore:

```text
functionName_()
```

Public callable functions MUST NOT end with underscore.

## 7. Schema v1.1.0 — Sheets

| Sheet | Required | Columns |
|---|---|---|
| Prompts | ✅ | 21 columns (incl. Variables, Rating, Use_Count, Last_Used_At) |
| Categories | ✅ | 6 columns |
| Subcategories | ✅ | 6 columns |
| Tags | ✅ | 6 columns |
| Prompt_Tags | ✅ | 3 columns |
| Settings | ✅ | 4 columns |
| Logs | ✅ | 7 columns |
| PromptVersions | ✅ | 6 columns |

## 8. Web App Allowed Actions (28 total)

healthCheck, installStrict, setupTest, firstStableWorkflowTest, fullIntegrityCheck, productionReadinessCheck, inspectWorkbook, migrationReport, addPrompt, getPrompt, searchPrompts, markFavorite, unmarkFavorite, toggleFavorite, archivePrompt, validatePrompt, fillTemplate, getTemplateVariables, updatePromptContent, getPromptHistory, exportPrompts, importPrompts, ratePrompt, recordPromptUsage, getTopRatedPrompts, getMostUsedPrompts, getRecentlyUsedPrompts

## 9. Apps Script File Creation Status

| File | Status |
|---|---|
| 01_prompt_library_schema_config.gs | ✅ Created |
| 02_prompt_library_schema_service.gs | ✅ Created |
| 03_prompt_library_document_service.gs | ✅ Created |
| 04_prompt_library_prompt_service.gs | ✅ Created |
| 05_prompt_library_taxonomy_service.gs | ✅ Created |
| 06_prompt_library_validation_service.gs | ✅ Created |
| 07_prompt_library_migration_service.gs | ✅ Created |
| 08_prompt_library_test_runner.gs | ✅ Created |
| 09_prompt_library_main.gs | ✅ Created |
| 10_prompt_library_strict_installer.gs | ✅ Created |
| 11_prompt_library_web_app_agent_gateway.gs | ✅ Created |
| 12_prompt_library_menu_controller.gs | ✅ Created |
| 13_schema_and_function_map_builder.gs | ✅ Created |

## 10. Current Deployment Stage

| Stage | Status |
|---|---|
| Base infrastructure files (01–13) | ✅ Created |
| HTML sidebar files | ✅ Created |
| Node.js client (agent-client.js) | ✅ Updated |
| Schema v1.1.0 | ✅ Released |
| Installation in clean test spreadsheet | ⏳ Pending |
| Web App deployment | ⏳ Pending |
| External agent test | ⏳ Pending |
