# Prompt Library File Manifest v2

## 1. Apps Script Files

| Order | File Name | Type | Purpose |
|---:|---|---|---|
| 01 | 01_prompt_library_schema_config.gs | Config | Canonical schema configuration |
| 02 | 02_prompt_library_schema_service.gs | Service | Sheet creation, schema initialization, logs |
| 03 | 03_prompt_library_document_service.gs | Service | Google Docs creation and update |
| 04 | 04_prompt_library_prompt_service.gs | Service | Prompt records, favorites, preview text |
| 05 | 05_prompt_library_taxonomy_service.gs | Service | Categories, subcategories, tags |
| 06 | 06_prompt_library_validation_service.gs | Service | Integrity checks and validation |
| 07 | 07_prompt_library_migration_service.gs | Service | Safe migration from existing workbook |
| 08 | 08_prompt_library_test_runner.gs | Test | Setup, workflow, validation tests |
| 09 | 09_prompt_library_main.gs | Main | Menu, install functions, orchestration |
| 10 | 10_prompt_library_strict_installer.gs | Installer | Strict installation pipeline with stop-on-error behavior |
| 11 | 11_prompt_library_web_app_agent_gateway.gs | Gateway | Web App endpoint for external agent operations |

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

## 4. Public Entry Points

| Function | File | Purpose |
|---|---|---|
| installPromptLibraryInfrastructure() | 09 | Full infrastructure installation |
| installPromptLibraryInfrastructureStrict() | 10 | Strict installation with stop-on-error behavior |
| initializePromptLibrary() | 02 | Create and verify required sheets |
| addPrompt(promptData) | 04 | Add one prompt and create linked document |
| doPost(e) | 11 | Web App action execution endpoint |
| doGet(e) | 11 | Web App health check endpoint |
| setAgentGatewayToken(token) | 11 | Store Web App agent token in script properties |
| runPromptLibrarySetupTest() | 08 | Validate setup |
| runFirstStableWorkflowTest() | 09 | Validate first working flow |
| runFullIntegrityCheck() | 06 | Run full validation |
| runProductionReadinessCheck() | 09 | Final readiness check |
| inspectExistingWorkbook() | 07 | Inspect current workbook state |
| buildMigrationReport() | 07 | Generate migration report |

## 5. Internal Helper Naming Convention

Internal helper functions MUST end with underscore:

```text
functionName_()
```

Public callable functions MUST NOT end with underscore.

## 6. Apps Script File Creation Status

| File | Status |
|---|---|
| 01_prompt_library_schema_config.gs | Created |
| 02_prompt_library_schema_service.gs | Created |
| 03_prompt_library_document_service.gs | Created |
| 04_prompt_library_prompt_service.gs | Created |
| 05_prompt_library_taxonomy_service.gs | Created |
| 06_prompt_library_validation_service.gs | Created |
| 07_prompt_library_migration_service.gs | Created |
| 08_prompt_library_test_runner.gs | Created |
| 09_prompt_library_main.gs | Created |
| 10_prompt_library_strict_installer.gs | Created |
| 11_prompt_library_web_app_agent_gateway.gs | Created |

## 7. External Agent Documents

| File Name | Type | Purpose |
|---|---|---|
| prompt_library_antigravity_agent_instructions.md | Agent Instructions | Web App operating instructions for Antigravity or another external agent |

## 8. Current Deployment Stage

| Stage | Status |
|---|---|
| Base infrastructure files | Created |
| Strict installer | Created |
| Web App agent gateway | Created |
| Antigravity instructions | Created |
| Installation in clean test spreadsheet | Pending |
| Web App deployment | Pending |
| External agent test | Pending |
