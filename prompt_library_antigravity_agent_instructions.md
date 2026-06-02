# Prompt Library Agent Instructions — API Reference

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

`healthCheck` is the only action that does not require a token (GET request).

## 4. Request Method Rules

| Method | Allowed Use |
|---|---|
| GET | `healthCheck` only |
| POST | All other actions |

## 5. All 29 Allowed Actions

### System & Installation

| Action | Parameters | Description |
|---|---|---|
| `healthCheck` | — | Verify Web App is reachable (GET, no token) |
| `installStrict` | — | Create all sheets and columns |
| `setupTest` | — | Validate infrastructure |
| `firstStableWorkflowTest` | — | End-to-end workflow test |
| `fullIntegrityCheck` | — | Validate all data and schemas |
| `productionReadinessCheck` | — | Final production gate (must return `ok: true`) |
| `inspectWorkbook` | — | Inspect current workbook state |
| `migrationReport` | — | Report on migration status |

### Prompt CRUD

| Action | Parameters | Description |
|---|---|---|
| `addPrompt` | `promptData: {...}` | Create a new prompt + Google Doc |
| `getPrompt` | `promptId` | Get a single prompt by ID |
| `searchPrompts` | `query` | Full-text search across all prompts |
| `filterPrompts` | `criteria: {...}` | Filter by category, status, rating, etc. |
| `archivePrompt` | `promptId` | Archive a prompt |
| `validatePrompt` | `promptId` | Validate a single prompt record |

### Favorites

| Action | Parameters | Description |
|---|---|---|
| `markFavorite` | `promptId` | Mark as favorite |
| `unmarkFavorite` | `promptId` | Remove from favorites |
| `toggleFavorite` | `promptId` | Toggle favorite status |

### Template System

| Action | Parameters | Description |
|---|---|---|
| `fillTemplate` | `promptId`, `variables: {...}` | Replace `{{var}}` placeholders with values |
| `getTemplateVariables` | `promptId` | Get defined variables for a template prompt |

### Versioning

| Action | Parameters | Description |
|---|---|---|
| `updatePromptContent` | `promptId`, `updates: {...}`, `changeSummary` | Update content + save version snapshot |
| `getPromptHistory` | `promptId` | Get full version history |

### Rating & Usage

| Action | Parameters | Description |
|---|---|---|
| `ratePrompt` | `promptId`, `rating` (1–5) | Set rating |
| `recordPromptUsage` | `promptId` | Increment use count + update Last_Used_At |
| `getTopRatedPrompts` | `limit` (default: 10) | Get N highest-rated prompts |
| `getMostUsedPrompts` | `limit` (default: 10) | Get N most-used prompts |
| `getRecentlyUsedPrompts` | `limit` (default: 10) | Get N most recently used prompts |

### Export / Import

| Action | Parameters | Description |
|---|---|---|
| `exportPrompts` | `includeArchived` (bool) | Export all prompts to JSON (creates Google Doc) |
| `importPrompts` | `jsonString` | Import prompts from JSON array |

---

## 6. Request Examples

### Health Check (GET)
```
GET {{WEB_APP_URL}}?action=healthCheck
```

### Add Prompt
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
    "Tool_Target": "General",
    "Prompt_Type": "General",
    "Status": "Active",
    "Source": "{{SOURCE}}",
    "Notes": "{{NOTES}}"
  }
}
```

**Required fields:** `Title`, `Category`, `Full_Prompt`, `Tool_Target`, `Prompt_Type`, `Status`

**Allowed values:**
- `Tool_Target`: `ChatGPT` | `Gemini` | `Claude` | `General`
- `Prompt_Type`: `System` | `Template` | `Audit` | `Research` | `Teaching` | `Design` | `Code` | `Workflow` | `General`
- `Status`: `Active` | `Draft` | `Deprecated` | `Archived`

### Search Prompts
```json
{
  "token": "{{AGENT_TOKEN}}",
  "action": "searchPrompts",
  "query": "{{QUERY}}"
}
```

### Filter Prompts
```json
{
  "token": "{{AGENT_TOKEN}}",
  "action": "filterPrompts",
  "criteria": {
    "category": "כתיבת פרומפטים",
    "status": "Active",
    "promptType": "Audit",
    "toolTarget": "Claude",
    "isFavorite": true,
    "minRating": 4,
    "query": "keyword"
  }
}
```
All criteria fields are optional and combinable.

### Fill Template
```json
{
  "token": "{{AGENT_TOKEN}}",
  "action": "fillTemplate",
  "promptId": "{{PROMPT_ID}}",
  "variables": {
    "language": "Python",
    "focus_area": "security"
  }
}
```

### Get Template Variables
```json
{
  "token": "{{AGENT_TOKEN}}",
  "action": "getTemplateVariables",
  "promptId": "{{PROMPT_ID}}"
}
```

### Update Prompt Content (creates version snapshot)
```json
{
  "token": "{{AGENT_TOKEN}}",
  "action": "updatePromptContent",
  "promptId": "{{PROMPT_ID}}",
  "updates": {
    "Full_Prompt": "Updated prompt text...",
    "Description": "Updated description"
  },
  "changeSummary": "Improved clarity and added constraints"
}
```

### Get Prompt History
```json
{
  "token": "{{AGENT_TOKEN}}",
  "action": "getPromptHistory",
  "promptId": "{{PROMPT_ID}}"
}
```

### Rate Prompt
```json
{
  "token": "{{AGENT_TOKEN}}",
  "action": "ratePrompt",
  "promptId": "{{PROMPT_ID}}",
  "rating": 5
}
```

### Record Usage
```json
{
  "token": "{{AGENT_TOKEN}}",
  "action": "recordPromptUsage",
  "promptId": "{{PROMPT_ID}}"
}
```

### Get Top Rated
```json
{
  "token": "{{AGENT_TOKEN}}",
  "action": "getTopRatedPrompts",
  "limit": 10
}
```

### Export Prompts
```json
{
  "token": "{{AGENT_TOKEN}}",
  "action": "exportPrompts",
  "includeArchived": false
}
```

### Import Prompts
```json
{
  "token": "{{AGENT_TOKEN}}",
  "action": "importPrompts",
  "jsonString": "[{\"Title\":\"...\", ...}]"
}
```

### Toggle Favorite
```json
{
  "token": "{{AGENT_TOKEN}}",
  "action": "toggleFavorite",
  "promptId": "{{PROMPT_ID}}"
}
```

### Archive Prompt
```json
{
  "token": "{{AGENT_TOKEN}}",
  "action": "archivePrompt",
  "promptId": "{{PROMPT_ID}}"
}
```

---

## 7. Response Handling

Every response returns a JSON object. Always inspect `ok`:

```json
{ "ok": true, "action": "...", "result": {...} }
{ "ok": false, "error": "...", "code": "..." }
```

If `ok === true` → continue to next step.

If `ok === false` → STOP and report:
```text
Failed action:
Error message:
Last successful action:
Recommended next check:
```

---

## 8. Installation Flow

```text
1. healthCheck         ← verify connectivity
2. installStrict       ← create sheets + columns
3. setupTest           ← validate infrastructure
4. firstStableWorkflowTest  ← end-to-end test
5. fullIntegrityCheck  ← validate data integrity
6. productionReadinessCheck ← must return ok: true
```

Do not continue after any failed step.

---

## 9. Execution Policy

1. Call only actions listed in Section 5.
2. Use GET only for `healthCheck`. Use POST for everything else.
3. Include the token in every POST request.
4. Inspect every response — stop on `ok: false`.
5. Do not retry state-changing actions without explicit instruction.
6. Do not run migration actions unless explicitly asked.
7. Do not delete sheets, rows, documents, or Drive files.
8. Do not expose the token in output.

---

## 10. Stop Conditions

| Condition | Required Output |
|---|---|
| `ok: false` | Error report |
| Unauthorized | Token/configuration issue |
| Unknown action | Check Section 5 |
| Missing required field | Prompt data issue |
| `Full_Doc_Link` missing after `addPrompt` | Document creation failure |
| Validation fails | Validation report |

---

## 11. Schema Version

Current: **1.1.0** — 8 sheets, 21 columns in Prompts, 29 Web App actions.
