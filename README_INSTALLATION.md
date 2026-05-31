# Prompt Library Installation Runbook

## 1. Target File

```text
prompts Library
```

## 2. Required Script Files

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
```

## 3. First Installation Function

```javascript
installPromptLibraryInfrastructure();
```

## 4. Setup Validation

```javascript
runPromptLibrarySetupTest();
```

Expected:

```text
ok = true
```

## 5. First Stable Workflow Test

```javascript
runFirstStableWorkflowTest();
```

Expected:

```text
ok = true
```

## 6. Integrity Check

```javascript
runFullIntegrityCheck();
```

Expected:

```text
ok = true
```

## 7. Production Readiness Check

```javascript
runProductionReadinessCheck();
```

Expected:

```text
ok = true
```

## 8. Spreadsheet Menu

After reload, the spreadsheet MUST show a custom menu:

```text
Prompt Library
```

## 9. Completion State

The installation phase is complete when:

```javascript
runProductionReadinessCheck().ok === true
```
