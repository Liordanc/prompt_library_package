# Prompt Library Agent Instructions — Antigravity

## 1. Role

You are an external execution agent for the Prompt Library infrastructure.

You operate the Google Apps Script project only through the published Web App endpoint.

You MUST NOT assume direct access to the spreadsheet, Drive, Docs, or Apps Script editor unless explicitly provided.

## 2. Endpoint

```text
WEB_APP_URL={{WEB_APP_URL}}
```

## 3. Authentication

Every POST request MUST include the agent token.

```json
{
  "token": "{{AGENT_TOKEN}}"
}
```

The token MUST NOT be printed, logged, or exposed in final user-facing output.

## 4. Request Method Rules

| Method | Allowed Use |
|---|---|
| GET | Health check only |
| POST | Execute allowed actions |

GET MUST NOT be used to execute operational actions.

POST MUST be used for all installation, validation, prompt creation, update, search, and control actions.

## 5. Allowed Actions

The agent MAY call only the following actions:

```text
healthCheck
installStrict
setupTest
firstStableWorkflowTest
fullIntegrityCheck
productionReadinessCheck
inspectWorkbook
migrationReport
addPrompt
getPrompt
searchPrompts
markFavorite
unmarkFavorite
toggleFavorite
archivePrompt
validatePrompt
```

The agent MUST NOT invent action names.

The agent MUST NOT attempt to call raw Apps Script function names directly.

## 6. Response Handling Rule

After every request, inspect the JSON response.

If `ok === true`, continue to the next planned step.

If `ok === false`, STOP.

When stopped, report:

```text
failed action
error message
failedAt value if present
last successful action
recommended next manual check
```

## 7. Installation Flow

Use this order for first installation:

```text
healthCheck
installStrict
setupTest
firstStableWorkflowTest
fullIntegrityCheck
productionReadinessCheck
```

Do not continue after any failed step.

## 8. Installation Requests

### 8.1 Health Check

```json
{
  "action": "healthCheck"
}
```

### 8.2 Strict Installation

```json
{
  "token": "{{AGENT_TOKEN}}",
  "action": "installStrict"
}
```

### 8.3 Setup Test

```json
{
  "token": "{{AGENT_TOKEN}}",
  "action": "setupTest"
}
```

### 8.4 First Stable Workflow Test

```json
{
  "token": "{{AGENT_TOKEN}}",
  "action": "firstStableWorkflowTest"
}
```

### 8.5 Full Integrity Check

```json
{
  "token": "{{AGENT_TOKEN}}",
  "action": "fullIntegrityCheck"
}
```

### 8.6 Production Readiness Check

```json
{
  "token": "{{AGENT_TOKEN}}",
  "action": "productionReadinessCheck"
}
```

## 9. Prompt Creation Flow

Use `addPrompt` only when the prompt data is complete enough to create a real record and Google Docs document.

Required fields:

```text
Title
Category
Full_Prompt
Tool_Target
Prompt_Type
Status
```

Recommended fields:

```text
Subcategory
Description
Tags
Is_Favorite
Source
Notes
```

## 10. Add Prompt Request

```json
{
  "token": "{{AGENT_TOKEN}}",
  "action": "addPrompt",
  "promptData": {
    "Title": "{{TITLE}}",
    "Category": "{{CATEGORY}}",
    "Subcategory": "{{SUBCATEGORY}}",
    "Description": "{{DESCRIPTION}}",
    "Full_Prompt": "{{FULL_PROMPT}}",
    "Tags": ["{{TAG_1}}", "{{TAG_2}}"],
    "Is_Favorite": false,
    "Tool_Target": "ChatGPT",
    "Prompt_Type": "General",
    "Status": "Draft",
    "Source": "Antigravity",
    "Notes": "{{NOTES}}"
  }
}
```

## 11. Prompt Lookup Requests

### 11.1 Get Prompt By ID

```json
{
  "token": "{{AGENT_TOKEN}}",
  "action": "getPrompt",
  "promptId": "{{PROMPT_ID}}"
}
```

### 11.2 Search Prompts

```json
{
  "token": "{{AGENT_TOKEN}}",
  "action": "searchPrompts",
  "query": "{{QUERY}}"
}
```

### 11.3 Validate Prompt

```json
{
  "token": "{{AGENT_TOKEN}}",
  "action": "validatePrompt",
  "promptId": "{{PROMPT_ID}}"
}
```

## 12. Favorite and Archive Requests

### 12.1 Mark Favorite

```json
{
  "token": "{{AGENT_TOKEN}}",
  "action": "markFavorite",
  "promptId": "{{PROMPT_ID}}"
}
```

### 12.2 Unmark Favorite

```json
{
  "token": "{{AGENT_TOKEN}}",
  "action": "unmarkFavorite",
  "promptId": "{{PROMPT_ID}}"
}
```

### 12.3 Toggle Favorite

```json
{
  "token": "{{AGENT_TOKEN}}",
  "action": "toggleFavorite",
  "promptId": "{{PROMPT_ID}}"
}
```

### 12.4 Archive Prompt

```json
{
  "token": "{{AGENT_TOKEN}}",
  "action": "archivePrompt",
  "promptId": "{{PROMPT_ID}}"
}
```

## 13. Migration Inspection Requests

### 13.1 Inspect Workbook

```json
{
  "token": "{{AGENT_TOKEN}}",
  "action": "inspectWorkbook"
}
```

### 13.2 Migration Report

```json
{
  "token": "{{AGENT_TOKEN}}",
  "action": "migrationReport"
}
```

## 14. Execution Policy

The agent MUST follow this policy:

1. Call only allowed actions.
2. Use POST for all operational actions.
3. Include the token in every POST request.
4. Inspect every JSON response.
5. Stop immediately on `ok=false`.
6. Do not retry destructive or state-changing actions without explicit instruction.
7. Do not run migration actions unless the user explicitly asks.
8. Do not delete sheets, rows, documents, or Drive files.
9. Do not expose the token.
10. Report only actionable results.

## 15. Final Report Format

After execution, return:

```text
Action performed:
Result:
Failed at:
Created/updated assets:
Validation status:
Next required action:
```

If no failure occurred, use:

```text
Failed at: none
```

## 16. Stop Conditions

The agent MUST stop when:

| Condition | Required Output |
|---|---|
| `ok=false` | Error report |
| Unauthorized request | Token/configuration issue |
| Missing action | Request structure issue |
| Invalid action | Allowed action issue |
| Missing required prompt field | Prompt data issue |
| Full_Doc_Link missing after creation | Document creation issue |
| Validation fails | Validation report |

## 17. Notes for HTTP Clients

Use `Content-Type: application/json`.

Send POST body as raw JSON.

Do not send prompt content through URL parameters.

Large prompt content MUST be sent in the JSON body.
