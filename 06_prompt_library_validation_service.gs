/**
 * Prompt Library Validation Service
 * Requires: PROMPT_LIBRARY_SCHEMA
 */

function runFullIntegrityCheck() {
  const results = {
    timestamp: new Date().toISOString(),
    sheets: validateRequiredSheets(),
    schemas: validateAllSheetSchemas(),
    prompts: validateAllPromptRecords(),
    categories: validateCategoryValues(),
    subcategories: validateSubcategoryValues(),
    statuses: validateStatusValues(),
    promptTypes: validatePromptTypeValues(),
    toolTargets: validateToolTargetValues(),
    docLinks: validateDocLinks()
  };

  results.ok = Object.keys(results)
    .filter(key => key !== "timestamp" && key !== "ok")
    .every(key => results[key].ok === true);

  logAction(
    "RUN_FULL_INTEGRITY_CHECK",
    "Workbook",
    SpreadsheetApp.getActiveSpreadsheet().getId(),
    results.ok ? "Success" : "Warning",
    JSON.stringify(summarizeValidationResults_(results))
  );

  return results;
}

function validateRequiredSheets() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const existingSheetNames = spreadsheet.getSheets().map(sheet => sheet.getName());

  const missingSheets = PROMPT_LIBRARY_SCHEMA.sheets
    .filter(sheetConfig => sheetConfig.required === true)
    .map(sheetConfig => sheetConfig.sheetName)
    .filter(sheetName => !existingSheetNames.includes(sheetName));

  return {
    ok: missingSheets.length === 0,
    missingSheets
  };
}

function validateAllSheetSchemas() {
  const results = PROMPT_LIBRARY_SCHEMA.sheets.map(sheetConfig => validateSheetSchema(sheetConfig.sheetName));

  return {
    ok: results.every(result => result.ok),
    results
  };
}

function validateSheetSchema(sheetName) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(sheetName);
  const sheetConfig = getSheetConfig_(sheetName);

  if (!sheet) {
    return {
      ok: false,
      sheetName,
      error: "Sheet does not exist"
    };
  }

  const existingHeaders = getHeaderRow_(sheet);
  const requiredHeaders = sheetConfig.columns.map(column => column.key);
  const missingColumns = requiredHeaders.filter(header => !existingHeaders.includes(header));

  return {
    ok: missingColumns.length === 0,
    sheetName,
    missingColumns,
    existingHeaders,
    requiredHeaders
  };
}

function validateAllPromptRecords() {
  const records = listSheetRecords_("Prompts");
  const results = records.map(record => validatePromptRecordShape_(record));

  return {
    ok: results.every(result => result.ok),
    total: results.length,
    invalid: results.filter(result => !result.ok)
  };
}

function validatePromptRecordShape_(record) {
  const requiredFields = getSheetConfig_("Prompts")
    .columns
    .filter(column => column.required === true)
    .map(column => column.key);

  const missingFields = requiredFields.filter(field => isBlank_(record[field]));
  const errors = [];

  if (missingFields.length > 0) {
    errors.push(`Missing required fields: ${missingFields.join(", ")}`);
  }

  if (!isBlank_(record.Full_Doc_Link) && !isGoogleDocsUrl_(record.Full_Doc_Link)) {
    errors.push("Full_Doc_Link is not a valid Google Docs URL");
  }

  if (!isBlank_(record.Is_Favorite) && typeof record.Is_Favorite !== "boolean" && !["TRUE", "FALSE", "true", "false", "כן", "לא"].includes(String(record.Is_Favorite))) {
    errors.push("Is_Favorite is not a valid boolean value");
  }

  if (!isBlank_(record.Rating)) {
    const r = Number(record.Rating);
    if (isNaN(r) || r < 1 || r > 5) errors.push("Rating must be between 1 and 5");
  }

  return {
    ok: errors.length === 0,
    promptId: record.Prompt_ID || "",
    title: record.Title || "",
    errors
  };
}

function validateDocLinks() {
  const records = listSheetRecords_("Prompts");
  const results = records.map(record => validateDocLink_(record));

  return {
    ok: results.every(result => result.ok),
    total: results.length,
    invalid: results.filter(result => !result.ok)
  };
}

function validateDocLink_(record) {
  if (isBlank_(record.Full_Doc_Link)) {
    return {
      ok: false,
      promptId: record.Prompt_ID,
      error: "Full_Doc_Link is missing"
    };
  }

  try {
    const documentId = extractDocumentIdFromUrl_(record.Full_Doc_Link);
    const document = DocumentApp.openById(documentId);
    const bodyText = document.getBody().getText();

    if (!bodyText.includes(String(record.Prompt_ID))) {
      return {
        ok: false,
        promptId: record.Prompt_ID,
        documentId,
        error: "Document exists but does not contain matching Prompt_ID"
      };
    }

    return {
      ok: true,
      promptId: record.Prompt_ID,
      documentId
    };
  } catch (error) {
    return {
      ok: false,
      promptId: record.Prompt_ID,
      error: error.message
    };
  }
}

function validateCategoryValues() {
  const prompts = listSheetRecords_("Prompts");
  const categories = listSheetRecords_("Categories").map(record => String(record.Category_Name).trim());

  const invalid = prompts
    .filter(record => !isBlank_(record.Category))
    .filter(record => !categories.includes(String(record.Category).trim()))
    .map(record => ({
      promptId: record.Prompt_ID,
      category: record.Category
    }));

  return {
    ok: invalid.length === 0,
    invalid
  };
}

function validateSubcategoryValues() {
  const prompts = listSheetRecords_("Prompts");
  const invalid = [];

  prompts.forEach(record => {
    if (isBlank_(record.Subcategory)) {
      return;
    }

    const result = validateCategoryPair(record.Category, record.Subcategory);

    if (!result.ok) {
      invalid.push({
        promptId: record.Prompt_ID,
        category: record.Category,
        subcategory: record.Subcategory,
        error: result.error
      });
    }
  });

  return {
    ok: invalid.length === 0,
    invalid
  };
}

function validateStatusValues() {
  return validatePromptsControlledValue_("Status", PROMPT_LIBRARY_SCHEMA.controlledValues.status);
}

function validatePromptTypeValues() {
  return validatePromptsControlledValue_("Prompt_Type", PROMPT_LIBRARY_SCHEMA.controlledValues.promptType);
}

function validateToolTargetValues() {
  return validatePromptsControlledValue_("Tool_Target", PROMPT_LIBRARY_SCHEMA.controlledValues.toolTarget);
}

function validatePromptsControlledValue_(fieldName, allowedValues) {
  const prompts = listSheetRecords_("Prompts");

  const invalid = prompts
    .filter(record => !isBlank_(record[fieldName]))
    .filter(record => !allowedValues.includes(String(record[fieldName]).trim()))
    .map(record => ({
      promptId: record.Prompt_ID,
      fieldName,
      value: record[fieldName]
    }));

  return {
    ok: invalid.length === 0,
    fieldName,
    allowedValues,
    invalid
  };
}

function validateUniquePromptIds() {
  const prompts = listSheetRecords_("Prompts");
  const seen = new Set();
  const duplicates = [];

  prompts.forEach(record => {
    const promptId = String(record.Prompt_ID || "").trim();

    if (!promptId) {
      return;
    }

    if (seen.has(promptId)) {
      duplicates.push(promptId);
    }

    seen.add(promptId);
  });

  return {
    ok: duplicates.length === 0,
    duplicates
  };
}

function validateUniqueDocLinks() {
  const prompts = listSheetRecords_("Prompts");
  const seen = new Set();
  const duplicates = [];

  prompts.forEach(record => {
    const link = String(record.Full_Doc_Link || "").trim();

    if (!link) {
      return;
    }

    if (seen.has(link)) {
      duplicates.push({
        promptId: record.Prompt_ID,
        link
      });
    }

    seen.add(link);
  });

  return {
    ok: duplicates.length === 0,
    duplicates
  };
}

function writeValidationReportToLogs(validationResult) {
  const summary = summarizeValidationResults_(validationResult);

  logAction("VALIDATION_REPORT", "Workbook", SpreadsheetApp.getActiveSpreadsheet().getId(), summary.ok ? "Success" : "Warning", JSON.stringify(summary));

  return summary;
}

function summarizeValidationResults_(results) {
  return {
    ok: results.ok === true,
    missingSheets: results.sheets && results.sheets.missingSheets ? results.sheets.missingSheets.length : 0,
    invalidSchemas: results.schemas && results.schemas.results ? results.schemas.results.filter(item => !item.ok).length : 0,
    invalidPrompts: results.prompts && results.prompts.invalid ? results.prompts.invalid.length : 0,
    invalidDocLinks: results.docLinks && results.docLinks.invalid ? results.docLinks.invalid.length : 0,
    invalidCategories: results.categories && results.categories.invalid ? results.categories.invalid.length : 0,
    invalidSubcategories: results.subcategories && results.subcategories.invalid ? results.subcategories.invalid.length : 0,
    invalidStatuses: results.statuses && results.statuses.invalid ? results.statuses.invalid.length : 0,
    invalidPromptTypes: results.promptTypes && results.promptTypes.invalid ? results.promptTypes.invalid.length : 0,
    invalidToolTargets: results.toolTargets && results.toolTargets.invalid ? results.toolTargets.invalid.length : 0
  };
}

function isBlank_(value) {
  return value === null || value === undefined || String(value).trim() === "";
}

function isGoogleDocsUrl_(value) {
  return /^https:\/\/docs\.google\.com\/document\/d\/[a-zA-Z0-9-_]+/.test(String(value || ""));
}
