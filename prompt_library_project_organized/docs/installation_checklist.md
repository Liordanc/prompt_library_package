# Installation Checklist

## 1. Google Sheet

Create a clean test spreadsheet first:

```text
Prompt Library - Test
```

## 2. Apps Script

Open:

```text
Extensions → Apps Script
```

Create files from the `source/` folder in numeric order.

## 3. Required First Run

Run:

```javascript
installPromptLibraryInfrastructureStrict();
```

Approve permissions.

## 4. Create Internal Documentation Sheets

Run:

```javascript
createSchemaAndFunctionMapSheets();
```

## 5. Validation

Run:

```javascript
runPromptLibrarySetupTest();
runFirstStableWorkflowTest();
runProductionReadinessCheck();
```

## 6. Web App

Deploy as Web App only after local setup passes.

## 7. Agent Token

Use the menu:

```text
Prompt Library → Setup → Create / Reset Agent Token
```

## 8. Stop Conditions

Stop if:

```text
ok=false
missing required sheets
missing columns
Full_Doc_Link is empty
Google Docs document is not created
production readiness fails
```
