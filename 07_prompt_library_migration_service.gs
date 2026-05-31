/**
 * Prompt Library Migration Service
 * Requires: PROMPT_LIBRARY_SCHEMA
 */

function inspectExistingWorkbook() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = spreadsheet.getSheets().map(sheet => ({
    sheetName: sheet.getName(),
    sheetId: sheet.getSheetId(),
    index: sheet.getIndex(),
    isHidden: sheet.isSheetHidden(),
    lastRow: sheet.getLastRow(),
    lastColumn: sheet.getLastColumn(),
    headers: getHeaderRow_(sheet)
  }));

  const result = {
    spreadsheetId: spreadsheet.getId(),
    spreadsheetName: spreadsheet.getName(),
    spreadsheetUrl: spreadsheet.getUrl(),
    inspectedAt: new Date().toISOString(),
    sheets
  };

  logAction("INSPECT_EXISTING_WORKBOOK", "Workbook", spreadsheet.getId(), "Success", `Inspected ${sheets.length} sheets`);

  return result;
}

function runSafeMigration() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const backup = backupSpreadsheetStructure_(spreadsheet);
  const inspection = inspectExistingWorkbook();

  const results = {
    backup,
    inspection,
    schema: migratePromptsSchema(),
    pinned: migratePinnedToFavorite(),
    content: migrateContentToPreview(),
    subcategories: createSubcategoriesSheet(),
    categories: migrateExistingCategories(),
    tags: migrateExistingTags(),
    deprecatedSheets: markDeprecatedSheetsForReview()
  };

  logAction("RUN_SAFE_MIGRATION", "Workbook", spreadsheet.getId(), "Success", "Safe migration completed");

  return results;
}

function migratePromptsSchema() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName("Prompts");

  if (!sheet) {
    throw new Error("Prompts sheet does not exist");
  }

  const beforeHeaders = getHeaderRow_(sheet);
  addMissingColumns_(spreadsheet, PROMPT_LIBRARY_SCHEMA);
  const afterHeaders = getHeaderRow_(sheet);

  const addedColumns = afterHeaders.filter(header => !beforeHeaders.includes(header));

  logAction("MIGRATE_PROMPTS_SCHEMA", "Sheet", "Prompts", "Success", `Added columns: ${addedColumns.join(", ")}`);

  return {
    sheetName: "Prompts",
    beforeHeaders,
    afterHeaders,
    addedColumns
  };
}

function migratePinnedToFavorite() {
  const sheet = getRequiredSheet_("Prompts");
  const headers = getHeaderRow_(sheet);
  const pinnedIndex = headers.indexOf("Is_Pinned") + 1;
  const favoriteIndex = headers.indexOf("Is_Favorite") + 1;

  if (!pinnedIndex || !favoriteIndex) {
    return {
      ok: false,
      skipped: true,
      reason: "Is_Pinned or Is_Favorite column missing"
    };
  }

  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    return {
      ok: true,
      updatedRows: 0
    };
  }

  const pinnedValues = sheet.getRange(2, pinnedIndex, lastRow - 1, 1).getValues();
  const favoriteValues = sheet.getRange(2, favoriteIndex, lastRow - 1, 1).getValues();
  let updatedRows = 0;

  const nextFavoriteValues = favoriteValues.map((row, index) => {
    const existingFavorite = row[0];
    const pinnedValue = pinnedValues[index][0];

    if (!isBlank_(existingFavorite)) {
      return [existingFavorite];
    }

    updatedRows += 1;
    return [parseBoolean_(pinnedValue)];
  });

  sheet.getRange(2, favoriteIndex, nextFavoriteValues.length, 1).setValues(nextFavoriteValues);

  logAction("MIGRATE_PINNED_TO_FAVORITE", "Sheet", "Prompts", "Success", `Updated ${updatedRows} rows`);

  return {
    ok: true,
    updatedRows
  };
}

function migrateContentToPreview() {
  const sheet = getRequiredSheet_("Prompts");
  const headers = getHeaderRow_(sheet);
  const contentIndex = headers.indexOf("Content") + 1;
  const previewIndex = headers.indexOf("Preview_Text") + 1;

  if (!contentIndex || !previewIndex) {
    return {
      ok: false,
      skipped: true,
      reason: "Content or Preview_Text column missing"
    };
  }

  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    return {
      ok: true,
      updatedRows: 0
    };
  }

  const contentValues = sheet.getRange(2, contentIndex, lastRow - 1, 1).getValues();
  const previewValues = sheet.getRange(2, previewIndex, lastRow - 1, 1).getValues();
  let updatedRows = 0;

  const nextPreviewValues = previewValues.map((row, index) => {
    const existingPreview = row[0];
    const contentValue = contentValues[index][0];

    if (!isBlank_(existingPreview)) {
      return [existingPreview];
    }

    if (isBlank_(contentValue)) {
      return [existingPreview];
    }

    updatedRows += 1;
    return [generatePreviewText(contentValue)];
  });

  sheet.getRange(2, previewIndex, nextPreviewValues.length, 1).setValues(nextPreviewValues);

  logAction("MIGRATE_CONTENT_TO_PREVIEW", "Sheet", "Prompts", "Success", `Updated ${updatedRows} rows`);

  return {
    ok: true,
    updatedRows
  };
}

function createSubcategoriesSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const existing = spreadsheet.getSheetByName("Subcategories");

  if (!existing) {
    spreadsheet.insertSheet("Subcategories");
  }

  addMissingColumns_(spreadsheet, PROMPT_LIBRARY_SCHEMA);
  seedInitialRows_(spreadsheet, PROMPT_LIBRARY_SCHEMA);

  logAction("CREATE_SUBCATEGORIES_SHEET", "Sheet", "Subcategories", "Success", "Subcategories sheet verified");

  return {
    ok: true,
    sheetName: "Subcategories"
  };
}

function migrateExistingCategories() {
  const sheet = getRequiredSheet_("Categories");
  const headers = getHeaderRow_(sheet);
  const records = listSheetRecords_("Categories");

  const existingNames = records
    .map(record => String(record.Category_Name || "").trim())
    .filter(Boolean);

  const requiredCategoryConfig = getSheetConfig_("Categories");
  const seedRows = requiredCategoryConfig.seedRows || [];
  const inserted = [];

  seedRows.forEach(row => {
    const categoryName = row[1];

    if (!existingNames.includes(categoryName)) {
      const normalized = normalizeSeedRow_(row, headers);
      sheet.appendRow(normalized);
      inserted.push(categoryName);
    }
  });

  logAction("MIGRATE_EXISTING_CATEGORIES", "Sheet", "Categories", "Success", `Inserted categories: ${inserted.join(", ")}`);

  return {
    ok: true,
    existingNames,
    inserted
  };
}

function migrateExistingTags() {
  const sheet = getRequiredSheet_("Tags");
  const headers = getHeaderRow_(sheet);
  const records = listSheetRecords_("Tags");
  const repairedRows = [];

  records.forEach((record, index) => {
    const rowIndex = index + 2;
    const updates = {};

    if (isBlank_(record.Tag_ID)) {
      updates.Tag_ID = createId_(PROMPT_LIBRARY_SCHEMA.settings.idPrefixes.tag);
    }

    if (headers.includes("Date_Created") && isBlank_(record.Date_Created)) {
      updates.Date_Created = new Date();
    }

    if (headers.includes("Date_Modified") && isBlank_(record.Date_Modified)) {
      updates.Date_Modified = new Date();
    }

    if (Object.keys(updates).length > 0) {
      const currentRow = sheet.getRange(rowIndex, 1, 1, headers.length).getValues()[0];
      const currentRecord = objectFromHeaders_(headers, currentRow);
      const nextRecord = Object.assign({}, currentRecord, updates);
      const nextRow = headers.map(header => nextRecord[header] || "");

      sheet.getRange(rowIndex, 1, 1, headers.length).setValues([nextRow]);
      repairedRows.push(rowIndex);
    }
  });

  logAction("MIGRATE_EXISTING_TAGS", "Sheet", "Tags", "Success", `Repaired ${repairedRows.length} rows`);

  return {
    ok: true,
    repairedRows
  };
}

function markDeprecatedSheetsForReview() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const deprecated = PROMPT_LIBRARY_SCHEMA.migration.deprecatedSheetsDetected || [];
  const found = [];
  const missing = [];

  deprecated.forEach(sheetName => {
    const sheet = spreadsheet.getSheetByName(sheetName);

    if (!sheet) {
      missing.push(sheetName);
      return;
    }

    found.push({
      sheetName,
      isHidden: sheet.isSheetHidden(),
      lastRow: sheet.getLastRow(),
      lastColumn: sheet.getLastColumn()
    });
  });

  logAction("MARK_DEPRECATED_SHEETS_FOR_REVIEW", "Workbook", spreadsheet.getId(), "Success", `Found ${found.length} deprecated sheets for review`);

  return {
    ok: true,
    found,
    missing
  };
}

function hideDeprecatedSheetsAfterReview(sheetNames) {
  if (!Array.isArray(sheetNames) || sheetNames.length === 0) {
    throw new Error("sheetNames must be a non-empty array");
  }

  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const hidden = [];

  sheetNames.forEach(sheetName => {
    const sheet = spreadsheet.getSheetByName(sheetName);

    if (!sheet) {
      return;
    }

    sheet.hideSheet();
    hidden.push(sheetName);
  });

  logAction("HIDE_DEPRECATED_SHEETS_AFTER_REVIEW", "Workbook", spreadsheet.getId(), "Success", `Hidden sheets: ${hidden.join(", ")}`);

  return {
    ok: true,
    hidden
  };
}

function buildMigrationReport() {
  const inspection = inspectExistingWorkbook();
  const schemaValidation = validateAllSheetSchemas();
  const categoryValidation = validateCategoryValues();
  const subcategoryValidation = validateSubcategoryValues();
  const statusValidation = validateStatusValues();
  const promptTypeValidation = validatePromptTypeValues();
  const toolTargetValidation = validateToolTargetValues();

  return {
    generatedAt: new Date().toISOString(),
    inspection,
    schemaValidation,
    categoryValidation,
    subcategoryValidation,
    statusValidation,
    promptTypeValidation,
    toolTargetValidation
  };
}
