/**
 * Prompt Library Taxonomy Service
 * Requires: PROMPT_LIBRARY_SCHEMA
 */

function addCategory(categoryData) {
  const normalized = normalizeCategoryData_(categoryData);
  const sheet = getRequiredSheet_("Categories");
  const headers = getHeaderRow_(sheet);

  assertUniqueValue_(sheet, "Category_ID", normalized.Category_ID);
  assertUniqueValue_(sheet, "Category_Name", normalized.Category_Name);

  sheet.appendRow(headers.map(header => normalized[header] || ""));

  logAction("ADD_CATEGORY", "Category", normalized.Category_ID, "Success", `Category added: ${normalized.Category_Name}`);

  return normalized;
}

function updateCategory(categoryId, updates) {
  return updateRecordByKey_("Categories", "Category_ID", categoryId, updates, "UPDATE_CATEGORY");
}

function getCategoryByName(categoryName) {
  return getRecordByKey_("Categories", "Category_Name", categoryName);
}

function getCategoryById(categoryId) {
  return getRecordByKey_("Categories", "Category_ID", categoryId);
}

function listCategories() {
  return listSheetRecords_("Categories");
}

function addSubcategory(subcategoryData) {
  const normalized = normalizeSubcategoryData_(subcategoryData);
  const sheet = getRequiredSheet_("Subcategories");
  const headers = getHeaderRow_(sheet);

  assertUniqueValue_(sheet, "Subcategory_ID", normalized.Subcategory_ID);

  if (!getCategoryByName(normalized.Category)) {
    throw new Error(`Category does not exist: ${normalized.Category}`);
  }

  sheet.appendRow(headers.map(header => normalized[header] || ""));

  logAction("ADD_SUBCATEGORY", "Subcategory", normalized.Subcategory_ID, "Success", `Subcategory added: ${normalized.Category} / ${normalized.Subcategory}`);

  return normalized;
}

function updateSubcategory(subcategoryId, updates) {
  return updateRecordByKey_("Subcategories", "Subcategory_ID", subcategoryId, updates, "UPDATE_SUBCATEGORY");
}

function getSubcategoryById(subcategoryId) {
  return getRecordByKey_("Subcategories", "Subcategory_ID", subcategoryId);
}

function getSubcategoriesByCategory(categoryName) {
  return listSheetRecords_("Subcategories")
    .filter(record => String(record.Category).trim() === String(categoryName).trim());
}

function validateCategoryPair(category, subcategory) {
  const categoryRecord = getCategoryByName(category);

  if (!categoryRecord) {
    return {
      ok: false,
      category,
      subcategory,
      error: `Category does not exist: ${category}`
    };
  }

  if (!subcategory) {
    return {
      ok: true,
      category,
      subcategory: ""
    };
  }

  const matchingSubcategory = getSubcategoriesByCategory(category)
    .find(record => String(record.Subcategory).trim() === String(subcategory).trim());

  if (!matchingSubcategory) {
    return {
      ok: false,
      category,
      subcategory,
      error: `Subcategory does not belong to category: ${category} / ${subcategory}`
    };
  }

  return {
    ok: true,
    category,
    subcategory
  };
}

function addTag(tagData) {
  const normalized = normalizeTagData_(tagData);
  const sheet = getRequiredSheet_("Tags");
  const headers = getHeaderRow_(sheet);

  assertUniqueValue_(sheet, "Tag_ID", normalized.Tag_ID);
  assertUniqueValue_(sheet, "Tag_Name", normalized.Tag_Name);

  sheet.appendRow(headers.map(header => normalized[header] || ""));

  logAction("ADD_TAG", "Tag", normalized.Tag_ID, "Success", `Tag added: ${normalized.Tag_Name}`);

  return normalized;
}

function getTagByName(tagName) {
  return getRecordByKey_("Tags", "Tag_Name", tagName);
}

function getTagById(tagId) {
  return getRecordByKey_("Tags", "Tag_ID", tagId);
}

function listTags() {
  return listSheetRecords_("Tags");
}

function getOrCreateTag(tagName) {
  const existing = getTagByName(tagName);

  if (existing) {
    return existing;
  }

  return addTag({
    Tag_Name: tagName
  });
}

function assignTagToPrompt(promptId, tagId) {
  const prompt = getPromptRecordById(promptId);

  if (!prompt) {
    throw new Error(`Prompt does not exist: ${promptId}`);
  }

  const tag = getTagById(tagId);

  if (!tag) {
    throw new Error(`Tag does not exist: ${tagId}`);
  }

  const existingRelations = listSheetRecords_("Prompt_Tags");
  const exists = existingRelations.some(record =>
    String(record.Prompt_ID).trim() === String(promptId).trim() &&
    String(record.Tag_ID).trim() === String(tagId).trim()
  );

  if (exists) {
    return {
      Prompt_ID: promptId,
      Tag_ID: tagId,
      alreadyExists: true
    };
  }

  const sheet = getRequiredSheet_("Prompt_Tags");
  const headers = getHeaderRow_(sheet);
  const rowData = {
    Prompt_ID: promptId,
    Tag_ID: tagId,
    Date_Created: new Date()
  };

  sheet.appendRow(headers.map(header => rowData[header] || ""));

  logAction("ASSIGN_TAG_TO_PROMPT", "Prompt_Tag", `${promptId}:${tagId}`, "Success", "Tag assigned to prompt");

  return rowData;
}

function removeTagFromPrompt(promptId, tagId) {
  const sheet = getRequiredSheet_("Prompt_Tags");
  const headers = getHeaderRow_(sheet);
  const promptColumnIndex = headers.indexOf("Prompt_ID") + 1;
  const tagColumnIndex = headers.indexOf("Tag_ID") + 1;

  if (!promptColumnIndex || !tagColumnIndex) {
    throw new Error("Prompt_Tags schema is invalid");
  }

  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    return false;
  }

  const values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();

  for (let i = values.length - 1; i >= 0; i--) {
    const row = values[i];
    const isMatch =
      String(row[promptColumnIndex - 1]).trim() === String(promptId).trim() &&
      String(row[tagColumnIndex - 1]).trim() === String(tagId).trim();

    if (isMatch) {
      sheet.deleteRow(i + 2);

      logAction("REMOVE_TAG_FROM_PROMPT", "Prompt_Tag", `${promptId}:${tagId}`, "Success", "Tag removed from prompt");

      return true;
    }
  }

  return false;
}

function getPromptTags(promptId) {
  const relations = listSheetRecords_("Prompt_Tags")
    .filter(record => String(record.Prompt_ID).trim() === String(promptId).trim());

  return relations.map(relation => getTagById(relation.Tag_ID)).filter(Boolean);
}

function syncPromptTags(promptId, tagList) {
  const normalizedTagNames = normalizeTags_(tagList);
  const tagRecords = normalizedTagNames.map(tagName => getOrCreateTag(tagName));
  const desiredTagIds = tagRecords.map(tag => tag.Tag_ID);
  const currentRelations = listSheetRecords_("Prompt_Tags")
    .filter(record => String(record.Prompt_ID).trim() === String(promptId).trim());

  currentRelations.forEach(relation => {
    if (!desiredTagIds.includes(relation.Tag_ID)) {
      removeTagFromPrompt(promptId, relation.Tag_ID);
    }
  });

  tagRecords.forEach(tag => {
    assignTagToPrompt(promptId, tag.Tag_ID);
  });

  updatePromptRecord(promptId, {
    Tags: normalizedTagNames.join(", ")
  });

  return {
    promptId,
    tags: tagRecords
  };
}

function normalizeCategoryData_(categoryData) {
  const now = new Date();

  return {
    Category_ID: categoryData.Category_ID || createId_(PROMPT_LIBRARY_SCHEMA.settings.idPrefixes.category),
    Category_Name: String(categoryData.Category_Name || categoryData.Category || "").trim(),
    Description: String(categoryData.Description || "").trim(),
    Sort_Order: categoryData.Sort_Order || "",
    Date_Created: categoryData.Date_Created || now,
    Date_Modified: categoryData.Date_Modified || now
  };
}

function normalizeSubcategoryData_(subcategoryData) {
  const now = new Date();

  return {
    Subcategory_ID: subcategoryData.Subcategory_ID || createId_(PROMPT_LIBRARY_SCHEMA.settings.idPrefixes.subcategory),
    Category: String(subcategoryData.Category || "").trim(),
    Subcategory: String(subcategoryData.Subcategory || "").trim(),
    Description: String(subcategoryData.Description || "").trim(),
    Date_Created: subcategoryData.Date_Created || now,
    Date_Modified: subcategoryData.Date_Modified || now
  };
}

function normalizeTagData_(tagData) {
  const now = new Date();

  return {
    Tag_ID: tagData.Tag_ID || createId_(PROMPT_LIBRARY_SCHEMA.settings.idPrefixes.tag),
    Tag_Name: String(tagData.Tag_Name || tagData.Tag || "").trim(),
    Tag_Color: String(tagData.Tag_Color || "").trim(),
    Description: String(tagData.Description || "").trim(),
    Date_Created: tagData.Date_Created || now,
    Date_Modified: tagData.Date_Modified || now
  };
}

function getRequiredSheet_(sheetName) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    throw new Error(`Required sheet does not exist: ${sheetName}`);
  }

  return sheet;
}

function listSheetRecords_(sheetName) {
  const sheet = getRequiredSheet_(sheetName);
  const headers = getHeaderRow_(sheet);
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    return [];
  }

  return sheet
    .getRange(2, 1, lastRow - 1, headers.length)
    .getValues()
    .map(row => objectFromHeaders_(headers, row));
}

function getRecordByKey_(sheetName, keyColumn, keyValue) {
  return listSheetRecords_(sheetName)
    .find(record => String(record[keyColumn]).trim() === String(keyValue).trim()) || null;
}

function updateRecordByKey_(sheetName, keyColumn, keyValue, updates, actionType) {
  const sheet = getRequiredSheet_(sheetName);
  const headers = getHeaderRow_(sheet);
  const keyColumnIndex = headers.indexOf(keyColumn) + 1;

  if (!keyColumnIndex) {
    throw new Error(`Key column does not exist: ${sheetName}.${keyColumn}`);
  }

  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    throw new Error(`No records found in sheet: ${sheetName}`);
  }

  const keyValues = sheet.getRange(2, keyColumnIndex, lastRow - 1, 1).getValues().flat();
  const matchIndex = keyValues.findIndex(value => String(value).trim() === String(keyValue).trim());

  if (matchIndex === -1) {
    throw new Error(`Record not found: ${sheetName}.${keyColumn}=${keyValue}`);
  }

  const rowIndex = matchIndex + 2;
  const currentRow = sheet.getRange(rowIndex, 1, 1, headers.length).getValues()[0];
  const currentRecord = objectFromHeaders_(headers, currentRow);
  const nextRecord = Object.assign({}, currentRecord, updates);

  if (headers.includes("Date_Modified")) {
    nextRecord.Date_Modified = new Date();
  }

  const nextRow = headers.map(header => nextRecord[header] || "");
  sheet.getRange(rowIndex, 1, 1, headers.length).setValues([nextRow]);

  logAction(actionType || "UPDATE_RECORD", sheetName, keyValue, "Success", `Record updated in ${sheetName}`);

  return nextRecord;
}

function assertUniqueValue_(sheet, columnName, value) {
  const headers = getHeaderRow_(sheet);
  const columnIndex = headers.indexOf(columnName) + 1;

  if (!columnIndex) {
    throw new Error(`Column does not exist: ${columnName}`);
  }

  const existingValues = getColumnValues_(sheet, columnIndex);
  const exists = existingValues.some(existing => String(existing).trim() === String(value).trim());

  if (exists) {
    throw new Error(`Duplicate value not allowed: ${columnName}=${value}`);
  }
}
