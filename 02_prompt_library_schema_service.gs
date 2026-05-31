/**
 * Prompt Library Schema Service
 * Requires: PROMPT_LIBRARY_SCHEMA
 */

function initializePromptLibrary() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  backupSpreadsheetStructure_(spreadsheet);
  createMissingSheets_(spreadsheet, PROMPT_LIBRARY_SCHEMA);
  applySheetOrder_(spreadsheet, PROMPT_LIBRARY_SCHEMA);
  addMissingColumns_(spreadsheet, PROMPT_LIBRARY_SCHEMA);
  applyFrozenRows_(spreadsheet, PROMPT_LIBRARY_SCHEMA);
  seedInitialRows_(spreadsheet, PROMPT_LIBRARY_SCHEMA);
  logAction("INITIALIZE_LIBRARY", "Workbook", spreadsheet.getId(), "Success", "Prompt Library schema initialized");

  return {
    ok: true,
    spreadsheetId: spreadsheet.getId(),
    spreadsheetUrl: spreadsheet.getUrl(),
    timestamp: new Date().toISOString()
  };
}

function verifyRequiredSheets() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const existingSheetNames = spreadsheet.getSheets().map(sheet => sheet.getName());

  const results = PROMPT_LIBRARY_SCHEMA.sheets.map(sheetConfig => ({
    sheetName: sheetConfig.sheetName,
    required: sheetConfig.required === true,
    exists: existingSheetNames.includes(sheetConfig.sheetName)
  }));

  return {
    ok: results.every(item => !item.required || item.exists),
    results
  };
}

function verifyPromptsSchema() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const promptsConfig = getSheetConfig_("Prompts");
  const sheet = spreadsheet.getSheetByName("Prompts");

  if (!sheet) {
    return {
      ok: false,
      error: "Prompts sheet does not exist"
    };
  }

  const existingHeaders = getHeaderRow_(sheet);
  const requiredHeaders = promptsConfig.columns.map(column => column.key);
  const missingColumns = requiredHeaders.filter(header => !existingHeaders.includes(header));

  return {
    ok: missingColumns.length === 0,
    sheetName: "Prompts",
    existingHeaders,
    requiredHeaders,
    missingColumns
  };
}

function createMissingSheets_(spreadsheet, schema) {
  const existingSheetNames = spreadsheet.getSheets().map(sheet => sheet.getName());

  schema.sheets
    .filter(sheetConfig => sheetConfig.required === true)
    .forEach(sheetConfig => {
      if (!existingSheetNames.includes(sheetConfig.sheetName)) {
        spreadsheet.insertSheet(sheetConfig.sheetName);
        logAction("CREATE_SHEET", "Sheet", sheetConfig.sheetName, "Success", "Created missing required sheet");
      }
    });
}

function addMissingColumns_(spreadsheet, schema) {
  schema.sheets.forEach(sheetConfig => {
    const sheet = spreadsheet.getSheetByName(sheetConfig.sheetName);

    if (!sheet) {
      return;
    }

    const existingHeaders = getHeaderRow_(sheet);
    const requiredHeaders = sheetConfig.columns.map(column => column.key);

    if (existingHeaders.length === 0) {
      sheet.getRange(1, 1, 1, requiredHeaders.length).setValues([requiredHeaders]);
      logAction("SET_HEADER_ROW", "Sheet", sheetConfig.sheetName, "Success", "Created header row");
      return;
    }

    const missingHeaders = requiredHeaders.filter(header => !existingHeaders.includes(header));

    if (missingHeaders.length === 0) {
      return;
    }

    const startColumn = existingHeaders.length + 1;
    sheet.getRange(1, startColumn, 1, missingHeaders.length).setValues([missingHeaders]);

    logAction(
      "ADD_MISSING_COLUMNS",
      "Sheet",
      sheetConfig.sheetName,
      "Success",
      `Added columns: ${missingHeaders.join(", ")}`
    );
  });
}

function applyFrozenRows_(spreadsheet, schema) {
  schema.sheets.forEach(sheetConfig => {
    const sheet = spreadsheet.getSheetByName(sheetConfig.sheetName);

    if (!sheet || !sheetConfig.freezeRows) {
      return;
    }

    sheet.setFrozenRows(sheetConfig.freezeRows);
  });
}

function applySheetOrder_(spreadsheet, schema) {
  const orderedSheets = schema.sheets
    .filter(sheetConfig => sheetConfig.required === true)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  orderedSheets.forEach((sheetConfig, index) => {
    const sheet = spreadsheet.getSheetByName(sheetConfig.sheetName);

    if (!sheet) {
      return;
    }

    spreadsheet.setActiveSheet(sheet);
    spreadsheet.moveActiveSheet(index + 1);
  });
}

function seedInitialRows_(spreadsheet, schema) {
  schema.sheets.forEach(sheetConfig => {
    if (!sheetConfig.seedRows || sheetConfig.seedRows.length === 0) {
      return;
    }

    const sheet = spreadsheet.getSheetByName(sheetConfig.sheetName);

    if (!sheet) {
      return;
    }

    const headers = getHeaderRow_(sheet);
    const firstKey = headers[0];
    const existingFirstColumnValues = getColumnValues_(sheet, 1);

    const rowsToInsert = sheetConfig.seedRows.filter(row => {
      const firstValue = row[0];
      return !existingFirstColumnValues.includes(firstValue);
    });

    if (rowsToInsert.length === 0) {
      return;
    }

    const normalizedRows = rowsToInsert.map(row => normalizeSeedRow_(row, headers));
    const startRow = Math.max(sheet.getLastRow() + 1, 2);

    sheet.getRange(startRow, 1, normalizedRows.length, headers.length).setValues(normalizedRows);

    logAction(
      "SEED_ROWS",
      "Sheet",
      sheetConfig.sheetName,
      "Success",
      `Inserted ${rowsToInsert.length} seed rows using key ${firstKey}`
    );
  });
}

function backupSpreadsheetStructure_(spreadsheet) {
  if (!PROMPT_LIBRARY_SCHEMA.workbook.protectedMode) {
    return null;
  }

  const timestamp = Utilities.formatDate(
    new Date(),
    PROMPT_LIBRARY_SCHEMA.timezone,
    "yyyy-MM-dd HH:mm:ss"
  );

  const backupName = PROMPT_LIBRARY_SCHEMA.workbook.backupNamePattern.replace("{{timestamp}}", timestamp);
  const file = DriveApp.getFileById(spreadsheet.getId());
  const backupFile = file.makeCopy(backupName);

  return {
    backupFileId: backupFile.getId(),
    backupFileUrl: backupFile.getUrl()
  };
}

function getSheetConfig_(sheetName) {
  const config = PROMPT_LIBRARY_SCHEMA.sheets.find(sheet => sheet.sheetName === sheetName);

  if (!config) {
    throw new Error(`Missing sheet config: ${sheetName}`);
  }

  return config;
}

function getHeaderRow_(sheet) {
  const lastColumn = sheet.getLastColumn();

  if (lastColumn === 0) {
    return [];
  }

  const values = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];

  return values
    .map(value => String(value || "").trim())
    .filter(value => value.length > 0);
}

function getColumnValues_(sheet, columnNumber) {
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    return [];
  }

  return sheet
    .getRange(2, columnNumber, lastRow - 1, 1)
    .getValues()
    .flat()
    .map(value => String(value || "").trim())
    .filter(value => value.length > 0);
}

function normalizeSeedRow_(seedRow, headers) {
  const row = new Array(headers.length).fill("");

  seedRow.forEach((value, index) => {
    row[index] = value;
  });

  const now = new Date();

  headers.forEach((header, index) => {
    if ((header === "Date_Created" || header === "Date_Modified" || header === "Created_At" || header === "Updated_At") && row[index] === "") {
      row[index] = now;
    }
  });

  return row;
}

function logAction(actionType, entityType, entityId, status, message) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName("Logs");

  if (!sheet) {
    sheet = spreadsheet.insertSheet("Logs");
    sheet.getRange(1, 1, 1, 7).setValues([[
      "Log_ID",
      "Timestamp",
      "Action_Type",
      "Entity_Type",
      "Entity_ID",
      "Status",
      "Message"
    ]]);
    sheet.setFrozenRows(1);
  }

  const logId = createId_(PROMPT_LIBRARY_SCHEMA.settings.idPrefixes.log);

  sheet.appendRow([
    logId,
    new Date(),
    actionType,
    entityType,
    entityId,
    status,
    message
  ]);

  return logId;
}

function logError(actionType, entityType, entityId, errorMessage) {
  return logAction(actionType, entityType, entityId, "Error", errorMessage);
}

function createId_(prefix) {
  const timestamp = Utilities.formatDate(new Date(), PROMPT_LIBRARY_SCHEMA.timezone, "yyyyMMddHHmmss");
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");

  return `${prefix}-${timestamp}-${random}`;
}
