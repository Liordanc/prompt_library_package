/**
 * Prompt Library Prompt Service
 * Requires: PROMPT_LIBRARY_SCHEMA
 */

function addPrompt(promptData) {
  const normalized = normalizePromptData_(promptData);
  const documentResult = createPromptDocument(normalized);

  normalized.Full_Doc_Link = documentResult.documentUrl;
  normalized.Preview_Text = generatePreviewText(normalized.Full_Prompt || normalized.Preview_Text || "");

  const record = addPromptRecord(normalized);

  if (normalized.Tags && normalized.Tags.length > 0) {
    syncPromptTags(record.Prompt_ID, normalized.Tags);
  }

  validatePromptRecord(record.Prompt_ID);

  logAction("ADD_PROMPT", "Prompt", record.Prompt_ID, "Success", `Prompt created: ${record.Title}`);

  return record;
}

function addPromptRecord(promptData) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName("Prompts");

  if (!sheet) {
    throw new Error("Prompts sheet does not exist");
  }

  const headers = getHeaderRow_(sheet);
  const row = headers.map(header => getPromptFieldValue_(promptData, header));

  sheet.appendRow(row);

  return objectFromHeaders_(headers, row);
}

function updatePromptRecord(promptId, updates) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName("Prompts");
  const rowIndex = findPromptRowIndex_(sheet, promptId);

  if (!rowIndex) {
    throw new Error(`Prompt not found: ${promptId}`);
  }

  const headers = getHeaderRow_(sheet);
  const currentValues = sheet.getRange(rowIndex, 1, 1, headers.length).getValues()[0];
  const currentRecord = objectFromHeaders_(headers, currentValues);
  const nextRecord = Object.assign({}, currentRecord, updates, { Updated_At: new Date() });
  const nextRow = headers.map(header => nextRecord[header] || "");

  sheet.getRange(rowIndex, 1, 1, headers.length).setValues([nextRow]);

  logAction("UPDATE_PROMPT_RECORD", "Prompt", promptId, "Success", `Prompt record updated: ${promptId}`);

  return nextRecord;
}

function getPromptRecordById(promptId) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName("Prompts");
  const rowIndex = findPromptRowIndex_(sheet, promptId);

  if (!rowIndex) {
    return null;
  }

  const headers = getHeaderRow_(sheet);
  const values = sheet.getRange(rowIndex, 1, 1, headers.length).getValues()[0];

  return objectFromHeaders_(headers, values);
}

function findPromptRecords(query) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName("Prompts");
  const headers = getHeaderRow_(sheet);
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    return [];
  }

  const values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  const normalizedQuery = String(query || "").toLowerCase().trim();

  return values
    .map(row => objectFromHeaders_(headers, row))
    .filter(record => {
      const searchableText = [
        record.Prompt_ID,
        record.Title,
        record.Category,
        record.Subcategory,
        record.Description,
        record.Preview_Text,
        record.Tags,
        record.Tool_Target,
        record.Prompt_Type,
        record.Status,
        record.Source,
        record.Notes
      ].join(" ").toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
}

function markPromptFavorite(promptId) {
  return updatePromptRecord(promptId, { Is_Favorite: true });
}

function unmarkPromptFavorite(promptId) {
  return updatePromptRecord(promptId, { Is_Favorite: false });
}

function togglePromptFavorite(promptId) {
  const record = getPromptRecordById(promptId);

  if (!record) {
    throw new Error(`Prompt not found: ${promptId}`);
  }

  const currentState = parseBoolean_(record.Is_Favorite);

  return updatePromptRecord(promptId, { Is_Favorite: !currentState });
}

function getFavoritePrompts() {
  return findPromptRecords("").filter(record => parseBoolean_(record.Is_Favorite));
}

function archivePrompt(promptId) {
  return updatePromptRecord(promptId, { Status: "Archived" });
}

function deprecatePrompt(promptId) {
  return updatePromptRecord(promptId, { Status: "Deprecated" });
}

function restorePrompt(promptId) {
  return updatePromptRecord(promptId, { Status: "Active" });
}

function validatePromptRecord(promptId) {
  const record = getPromptRecordById(promptId);

  if (!record) {
    throw new Error(`Prompt record not found: ${promptId}`);
  }

  const requiredFields = getSheetConfig_("Prompts")
    .columns
    .filter(column => column.required === true)
    .map(column => column.key);

  const missingFields = requiredFields.filter(field => {
    const value = record[field];
    return value === null || value === undefined || String(value).trim() === "";
  });

  if (missingFields.length > 0) {
    logError("VALIDATE_PROMPT_RECORD", "Prompt", promptId, `Missing required fields: ${missingFields.join(", ")}`);

    return {
      ok: false,
      promptId,
      missingFields
    };
  }

  logAction("VALIDATE_PROMPT_RECORD", "Prompt", promptId, "Success", "Prompt record is valid");

  return {
    ok: true,
    promptId,
    missingFields: []
  };
}

function generatePreviewText(fullPromptText) {
  const limit = Number(PROMPT_LIBRARY_SCHEMA.settings.previewTextLimit || 1500);
  return truncatePreviewText(fullPromptText, limit);
}

function truncatePreviewText(text, limit) {
  const normalized = String(text || "").trim();

  if (normalized.length <= limit) {
    return normalized;
  }

  return `${normalized.slice(0, limit).trim()}…`;
}

function normalizePromptData_(promptData) {
  const now = new Date();
  const promptId = promptData.Prompt_ID || createId_(PROMPT_LIBRARY_SCHEMA.settings.idPrefixes.prompt);

  return {
    Prompt_ID: promptId,
    Title: String(promptData.Title || "").trim(),
    Category: String(promptData.Category || "כללי").trim(),
    Subcategory: String(promptData.Subcategory || "לא מסווג").trim(),
    Description: String(promptData.Description || "").trim(),
    Preview_Text: String(promptData.Preview_Text || "").trim(),
    Full_Prompt: String(promptData.Full_Prompt || promptData.Content || "").trim(),
    Full_Doc_Link: String(promptData.Full_Doc_Link || "").trim(),
    Tags: normalizeTags_(promptData.Tags),
    Is_Favorite: promptData.Is_Favorite === true,
    Tool_Target: String(promptData.Tool_Target || PROMPT_LIBRARY_SCHEMA.settings.defaultToolTarget).trim(),
    Prompt_Type: String(promptData.Prompt_Type || PROMPT_LIBRARY_SCHEMA.settings.defaultPromptType).trim(),
    Status: String(promptData.Status || PROMPT_LIBRARY_SCHEMA.settings.defaultPromptStatus).trim(),
    Version: String(promptData.Version || PROMPT_LIBRARY_SCHEMA.settings.defaultVersion).trim(),
    Created_At: promptData.Created_At || now,
    Updated_At: promptData.Updated_At || now,
    Source: String(promptData.Source || "").trim(),
    Notes: String(promptData.Notes || "").trim(),
    Variables: serializeVariables_(promptData.Variables)
  };
}

function getPromptFieldValue_(promptData, header) {
  if (header === "Tags") {
    return Array.isArray(promptData.Tags) ? promptData.Tags.join(", ") : String(promptData.Tags || "");
  }

  if (header === "Is_Favorite") {
    return promptData.Is_Favorite === true;
  }

  if (header in promptData) {
    return promptData[header];
  }

  return "";
}

function normalizeTags_(tags) {
  if (!tags) {
    return [];
  }

  if (Array.isArray(tags)) {
    return tags.map(tag => String(tag || "").trim()).filter(tag => tag.length > 0);
  }

  return String(tags).split(",").map(tag => tag.trim()).filter(tag => tag.length > 0);
}

function findPromptRowIndex_(sheet, promptId) {
  const headers = getHeaderRow_(sheet);
  const promptIdColumnIndex = headers.indexOf("Prompt_ID") + 1;

  if (promptIdColumnIndex === 0) {
    throw new Error("Prompt_ID column does not exist");
  }

  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    return null;
  }

  const values = sheet.getRange(2, promptIdColumnIndex, lastRow - 1, 1).getValues().flat();
  const matchIndex = values.findIndex(value => String(value).trim() === String(promptId).trim());

  return matchIndex === -1 ? null : matchIndex + 2;
}

function objectFromHeaders_(headers, row) {
  return headers.reduce((record, header, index) => {
    record[header] = row[index];
    return record;
  }, {});
}

function parseBoolean_(value) {
  if (value === true) {
    return true;
  }

  if (typeof value === "string") {
    return value.toLowerCase() === "true" || value === "כן";
  }

  return false;
}

// ─── Versioning System ────────────────────────────────────────────────────

function updatePromptContent(promptId, updates, changeSummary) {
  saveVersionSnapshot_(promptId, changeSummary || "Content updated");

  const record = getPromptRecordById(promptId);
  const nextVersion = incrementVersion_(record.Version);

  const result = updatePromptRecord(promptId, Object.assign({}, updates, { Version: nextVersion }));

  logAction("UPDATE_PROMPT_CONTENT", "Prompt", promptId, "Success", `Updated to ${nextVersion}: ${changeSummary || ""}`);

  return result;
}

function getPromptHistory(promptId) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName("PromptVersions");

  if (!sheet) return [];

  const headers = getHeaderRow_(sheet);
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) return [];

  const values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();

  return values
    .map(row => objectFromHeaders_(headers, row))
    .filter(record => String(record.Prompt_ID).trim() === String(promptId).trim())
    .sort((a, b) => new Date(b.Saved_At) - new Date(a.Saved_At));
}

function saveVersionSnapshot_(promptId, changeSummary) {
  const record = getPromptRecordById(promptId);
  if (!record) throw new Error(`Prompt not found: ${promptId}`);

  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName("PromptVersions");

  if (!sheet) throw new Error("PromptVersions sheet does not exist");

  const versionId = createId_(PROMPT_LIBRARY_SCHEMA.settings.idPrefixes.version);

  sheet.appendRow([versionId, promptId, record.Version, JSON.stringify(record), new Date(), changeSummary || ""]);

  logAction("SAVE_VERSION_SNAPSHOT", "Prompt", promptId, "Success", `Snapshot saved: ${record.Version}`);

  return { versionId, promptId, version: record.Version };
}

function incrementVersion_(currentVersion) {
  const text = String(currentVersion || PROMPT_LIBRARY_SCHEMA.settings.defaultVersion);
  const match = text.match(/^v?(\d+)\.(\d+)$/);
  if (!match) return text;
  return `v${match[1]}.${parseInt(match[2], 10) + 1}`;
}

// ─── Template System ───────────────────────────────────────────────────────

function fillTemplate(promptId, valuesMap) {
  const record = getPromptRecordById(promptId);
  if (!record) throw new Error(`Prompt not found: ${promptId}`);

  const fullText = getPromptFullText_(promptId);
  const usedVars = extractVariables_(fullText);

  if (usedVars.length === 0) {
    return { promptId, filledText: fullText, variables: [], substitutions: 0 };
  }

  const missing = usedVars.filter(v => valuesMap[v] === undefined || valuesMap[v] === null);
  if (missing.length > 0) {
    throw new Error(`Missing values for variables: ${missing.join(", ")}`);
  }

  let filledText = fullText;
  usedVars.forEach(varName => {
    filledText = filledText.replace(
      new RegExp("\\{\\{" + escapeRegex_(varName) + "\\}\\}", "g"),
      String(valuesMap[varName])
    );
  });

  logAction("FILL_TEMPLATE", "Prompt", promptId, "Success", `Template filled: ${usedVars.length} variables`);

  return { promptId, filledText, variables: usedVars, substitutions: usedVars.length };
}

function getTemplateVariables(promptId) {
  const record = getPromptRecordById(promptId);
  if (!record) throw new Error(`Prompt not found: ${promptId}`);

  const fullText = getPromptFullText_(promptId);
  const usedVars = extractVariables_(fullText);
  const definedVars = parseVariables_(record.Variables);

  return {
    promptId,
    isTemplate: usedVars.length > 0,
    usedVars,
    definedVars,
    allDeclared: usedVars.every(v => definedVars.some(d => d.name === v))
  };
}

function getPromptFullText_(promptId) {
  const record = getPromptRecordById(promptId);
  if (!record || !record.Full_Doc_Link) return String(record ? record.Preview_Text || "" : "");

  try {
    const documentId = extractDocumentIdFromUrl_(record.Full_Doc_Link);
    const body = DocumentApp.openById(documentId).getBody();
    const paragraphs = body.getParagraphs();
    const lines = [];
    let inSection = false;

    for (const para of paragraphs) {
      const isHeading2 = para.getHeading() === DocumentApp.ParagraphHeading.HEADING2;
      const text = para.getText().trim();

      if (isHeading2 && text === "Current Prompt") { inSection = true; continue; }
      if (inSection && isHeading2) break;
      if (inSection) lines.push(para.getText());
    }

    const result = lines.join("\n").trim();
    return result || String(record.Preview_Text || "");
  } catch (e) {
    logError("GET_PROMPT_FULL_TEXT", "Prompt", promptId, e.message);
    return String(record.Preview_Text || "");
  }
}

function extractVariables_(text) {
  const matches = String(text || "").match(/\{\{([^}]+)\}\}/g) || [];
  return [...new Set(matches.map(m => m.replace(/^\{\{|\}\}$/g, "").trim()))];
}

function validateTemplateVariables_(promptData) {
  const text = String(promptData.Full_Prompt || promptData.Preview_Text || "");
  const usedVars = extractVariables_(text);

  if (usedVars.length === 0) {
    return { ok: true, usedVars: [], definedVars: [], undeclared: [] };
  }

  const definedVars = parseVariables_(promptData.Variables).map(v => v.name);
  const undeclared = usedVars.filter(v => !definedVars.includes(v));

  return { ok: undeclared.length === 0, usedVars, definedVars, undeclared };
}

function parseVariables_(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(String(value));
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function serializeVariables_(variables) {
  if (!variables) return "";
  if (typeof variables === "string") return variables;
  if (Array.isArray(variables)) return variables.length > 0 ? JSON.stringify(variables) : "";
  return "";
}

function escapeRegex_(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
