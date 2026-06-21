# Prompt Library File Manifest

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

## Public Entry Points

| Function | Purpose |
|---|---|
| installPromptLibraryInfrastructure() | Full infrastructure installation |
| initializePromptLibrary() | Create and verify required sheets |
| runPromptLibrarySetupTest() | Validate setup |
| runFirstStableWorkflowTest() | Validate first working flow |
| runFullIntegrityCheck() | Run full validation |
| runProductionReadinessCheck() | Final readiness check |
| addPrompt(promptData) | Add one prompt and create linked document |
| inspectExistingWorkbook() | Inspect current workbook state |
| buildMigrationReport() | Generate migration report |
