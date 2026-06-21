/**
 * 🏷️ ניהול קטגוריות ותגיות — שירות הטקסונומיה של ספריית הפרומפטים
 *
 * קובץ זה מנהל את מבנה הסיווג של הספרייה — קטגוריות, תתי-קטגוריות ותגיות,
 * כולל חיבור בין תגיות לפרומפטים.
 *
 * תלויות: PROMPT_LIBRARY_SCHEMA
 *
 * פונקציות ציבוריות ראשיות:
 * - addCategory               — מוסיפה קטגוריה חדשה
 * - updateCategory             — מעדכנת פרטי קטגוריה קיימת
 * - getCategoryByName          — שולפת קטגוריה לפי שמה
 * - getCategoryById            — שולפת קטגוריה לפי מזהה
 * - listCategories             — מחזירה את כל הקטגוריות
 * - addSubcategory             — מוסיפה תת-קטגוריה חדשה
 * - updateSubcategory          — מעדכנת פרטי תת-קטגוריה
 * - getSubcategoryById         — שולפת תת-קטגוריה לפי מזהה
 * - getSubcategoriesByCategory — מחזירה תתי-קטגוריות של קטגוריה מסוימת
 * - validateCategoryPair       — בודקת שצמד קטגוריה/תת-קטגוריה חוקי
 * - addTag                     — מוסיפה תגית חדשה
 * - getTagByName               — שולפת תגית לפי שמה
 * - getTagById                 — שולפת תגית לפי מזהה
 * - listTags                   — מחזירה את כל התגיות
 * - getOrCreateTag             — שולפת תגית קיימת או יוצרת חדשה
 * - assignTagToPrompt          — מחברת תגית לפרומפט
 * - removeTagFromPrompt        — מנתקת תגית מפרומפט
 * - getPromptTags              — מחזירה תגיות של פרומפט מסוים
 * - syncPromptTags             — מסנכרנת את תגיות הפרומפט
 */

/**
 * מוסיפה קטגוריה חדשה לגיליון הקטגוריות.
 * מוודאת שאין כפילויות לפני ההוספה.
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @category ציבורי
 * @param {Object} categoryData — אובייקט עם פרטי הקטגוריה (שם, תיאור, סדר מיון)
 * @returns {Object} נתוני הקטגוריה שנוצרה
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

/**
 * מעדכנת פרטי קטגוריה קיימת לפי המזהה שלה.
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @category ציבורי
 * @param {string} categoryId — המזהה הייחודי של הקטגוריה לעדכון
 * @param {Object} updates — אובייקט עם השדות החדשים לעדכון
 * @returns {Object} הרשומה המעודכנת של הקטגוריה
 */
function updateCategory(categoryId, updates) {
  return updateRecordByKey_("Categories", "Category_ID", categoryId, updates, "UPDATE_CATEGORY");
}

/**
 * שולפת קטגוריה מהגיליון לפי שמה.
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @category ציבורי
 * @param {string} categoryName — שם הקטגוריה לחיפוש
 * @returns {Object|null} נתוני הקטגוריה, או null אם לא נמצאה
 */
function getCategoryByName(categoryName) {
  return getRecordByKey_("Categories", "Category_Name", categoryName);
}

/**
 * שולפת קטגוריה מהגיליון לפי המזהה הייחודי שלה.
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @category ציבורי
 * @param {string} categoryId — המזהה הייחודי של הקטגוריה
 * @returns {Object|null} נתוני הקטגוריה, או null אם לא נמצאה
 */
function getCategoryById(categoryId) {
  return getRecordByKey_("Categories", "Category_ID", categoryId);
}

/**
 * מחזירה את כל הקטגוריות הקיימות בגיליון.
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @category ציבורי
 * @returns {Object[]} רשימת כל הקטגוריות
 */
function listCategories() {
  return listSheetRecords_("Categories");
}

/**
 * מוסיפה תת-קטגוריה חדשה תחת קטגוריה קיימת.
 * מוודאת שהקטגוריה האב קיימת לפני ההוספה.
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @category ציבורי
 * @param {Object} subcategoryData — אובייקט עם פרטי תת-הקטגוריה (שם, קטגוריית אב, תיאור)
 * @returns {Object} נתוני תת-הקטגוריה שנוצרה
 */
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

/**
 * מעדכנת פרטי תת-קטגוריה קיימת לפי המזהה שלה.
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @category ציבורי
 * @param {string} subcategoryId — המזהה הייחודי של תת-הקטגוריה לעדכון
 * @param {Object} updates — אובייקט עם השדות החדשים לעדכון
 * @returns {Object} הרשומה המעודכנת של תת-הקטגוריה
 */
function updateSubcategory(subcategoryId, updates) {
  return updateRecordByKey_("Subcategories", "Subcategory_ID", subcategoryId, updates, "UPDATE_SUBCATEGORY");
}

/**
 * שולפת תת-קטגוריה מהגיליון לפי המזהה הייחודי שלה.
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @category ציבורי
 * @param {string} subcategoryId — המזהה הייחודי של תת-הקטגוריה
 * @returns {Object|null} נתוני תת-הקטגוריה, או null אם לא נמצאה
 */
function getSubcategoryById(subcategoryId) {
  return getRecordByKey_("Subcategories", "Subcategory_ID", subcategoryId);
}

/**
 * מחזירה את כל תתי-הקטגוריות השייכות לקטגוריה מסוימת.
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @category ציבורי
 * @param {string} categoryName — שם הקטגוריה שתתי-הקטגוריות שייכות אליה
 * @returns {Object[]} רשימת תתי-הקטגוריות של הקטגוריה
 */
function getSubcategoriesByCategory(categoryName) {
  return listSheetRecords_("Subcategories")
    .filter(record => String(record.Category).trim() === String(categoryName).trim());
}

/**
 * בודקת שצמד קטגוריה ותת-קטגוריה חוקי ומוגדר בגיליון.
 * מחזירה אובייקט תוצאה עם שדה ok לבדיקה מהירה.
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @category ציבורי
 * @param {string} category — שם הקטגוריה לבדיקה
 * @param {string} subcategory — שם תת-הקטגוריה לבדיקה (אופציונלי)
 * @returns {{ ok: boolean, category: string, subcategory: string, error?: string }} תוצאת הבדיקה
 */
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

/**
 * מוסיפה תגית חדשה לגיליון התגיות.
 * מוודאת שאין כפילויות לפני ההוספה.
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @category ציבורי
 * @param {Object} tagData — אובייקט עם פרטי התגית (שם, צבע, תיאור)
 * @returns {Object} נתוני התגית שנוצרה
 */
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

/**
 * שולפת תגית מהגיליון לפי שמה.
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @category ציבורי
 * @param {string} tagName — שם התגית לחיפוש
 * @returns {Object|null} נתוני התגית, או null אם לא נמצאה
 */
function getTagByName(tagName) {
  return getRecordByKey_("Tags", "Tag_Name", tagName);
}

/**
 * שולפת תגית מהגיליון לפי המזהה הייחודי שלה.
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @category ציבורי
 * @param {string} tagId — המזהה הייחודי של התגית
 * @returns {Object|null} נתוני התגית, או null אם לא נמצאה
 */
function getTagById(tagId) {
  return getRecordByKey_("Tags", "Tag_ID", tagId);
}

/**
 * מחזירה את כל התגיות הקיימות בגיליון.
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @category ציבורי
 * @returns {Object[]} רשימת כל התגיות
 */
function listTags() {
  return listSheetRecords_("Tags");
}

/**
 * שולפת תגית קיימת לפי שם, או יוצרת אחת חדשה אם לא קיימת.
 * שימושית כשרוצים להשתמש בתגית מבלי לדעת אם היא כבר קיימת.
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @category ציבורי
 * @param {string} tagName — שם התגית לשליפה או יצירה
 * @returns {Object} נתוני התגית (קיימת או חדשה)
 */
function getOrCreateTag(tagName) {
  const existing = getTagByName(tagName);

  if (existing) {
    return existing;
  }

  return addTag({
    Tag_Name: tagName
  });
}

/**
 * מחברת תגית לפרומפט — בודקת שאין כפילות לפני ההוספה.
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @category ציבורי
 * @param {string} promptId — המזהה הייחודי של הפרומפט
 * @param {string} tagId — המזהה הייחודי של התגית לחיבור
 * @returns {Object} אובייקט הקשר שנוצר (או עם שדה alreadyExists אם כבר קיים)
 */
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

/**
 * מנתקת תגית מפרומפט — מוחקת את השורה המקשרת ביניהם.
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @category ציבורי
 * @param {string} promptId — המזהה הייחודי של הפרומפט
 * @param {string} tagId — המזהה הייחודי של התגית להסרה
 * @returns {boolean} true אם הקשר הוסר בהצלחה, false אם לא נמצא
 */
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

/**
 * מחזירה את כל התגיות המחוברות לפרומפט מסוים.
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @category ציבורי
 * @param {string} promptId — המזהה הייחודי של הפרומפט
 * @returns {Object[]} רשימת אובייקטי התגיות המחוברות לפרומפט
 */
function getPromptTags(promptId) {
  const relations = listSheetRecords_("Prompt_Tags")
    .filter(record => String(record.Prompt_ID).trim() === String(promptId).trim());

  return relations.map(relation => getTagById(relation.Tag_ID)).filter(Boolean);
}

/**
 * מסנכרנת את תגיות הפרומפט — מוסיפה תגיות חסרות ומסירה תגיות שאינן ברשימה החדשה.
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @category ציבורי
 * @param {string} promptId — המזהה הייחודי של הפרומפט לסנכרון
 * @param {string|string[]} tagList — הרשימה הרצויה של תגיות (שמות)
 * @returns {{ promptId: string, tags: Object[] }} מזהה הפרומפט ורשימת התגיות לאחר הסנכרון
 */
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

/**
 * ממלאת ערכי ברירת מחדל לנתוני קטגוריה ומחזירה אובייקט מנורמל.
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 * @category פנימי
 * @param {Object} categoryData — נתוני הקטגוריה המקוריים שהתקבלו
 * @returns {Object} אובייקט קטגוריה מלא עם כל השדות הנדרשים
 */
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

/**
 * ממלאת ערכי ברירת מחדל לנתוני תת-קטגוריה ומחזירה אובייקט מנורמל.
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 * @category פנימי
 * @param {Object} subcategoryData — נתוני תת-הקטגוריה המקוריים שהתקבלו
 * @returns {Object} אובייקט תת-קטגוריה מלא עם כל השדות הנדרשים
 */
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

/**
 * ממלאת ערכי ברירת מחדל לנתוני תגית ומחזירה אובייקט מנורמל.
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 * @category פנימי
 * @param {Object} tagData — נתוני התגית המקוריים שהתקבלו
 * @returns {Object} אובייקט תגית מלא עם כל השדות הנדרשים
 */
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

/**
 * מחזירה גיליון ספציפי מהגיליון הפעיל ומשליכה שגיאה אם הגיליון לא קיים.
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 * @category פנימי
 * @param {string} sheetName — שם הגיליון הנדרש
 * @returns {GoogleAppsScript.Spreadsheet.Sheet} אובייקט הגיליון המבוקש
 */
function getRequiredSheet_(sheetName) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    throw new Error(`Required sheet does not exist: ${sheetName}`);
  }

  return sheet;
}

/**
 * מחזירה את כל הרשומות מגיליון נתון כרשימת אובייקטים.
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 * @category פנימי
 * @param {string} sheetName — שם הגיליון לקריאה
 * @returns {Object[]} רשימת כל הרשומות בגיליון (ללא שורת הכותרות)
 */
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

/**
 * שולפת רשומה אחת מגיליון לפי ערך בעמודת מפתח מסוימת.
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 * @category פנימי
 * @param {string} sheetName — שם הגיליון לחיפוש
 * @param {string} keyColumn — שם עמודת המפתח לחיפוש לפיה
 * @param {string} keyValue — הערך שמחפשים בעמודת המפתח
 * @returns {Object|null} הרשומה שנמצאה, או null אם לא קיימת
 */
function getRecordByKey_(sheetName, keyColumn, keyValue) {
  return listSheetRecords_(sheetName)
    .find(record => String(record[keyColumn]).trim() === String(keyValue).trim()) || null;
}

/**
 * מעדכנת רשומה קיימת בגיליון לפי ערך עמודת מפתח.
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 * @category פנימי
 * @param {string} sheetName — שם הגיליון שבו נמצאת הרשומה
 * @param {string} keyColumn — שם עמודת המפתח לאיתור הרשומה
 * @param {string} keyValue — הערך שמחפשים בעמודת המפתח
 * @param {Object} updates — אובייקט עם השדות החדשים לעדכון
 * @param {string} actionType — שם הפעולה לרישום ביומן
 * @returns {Object} הרשומה המעודכנת לאחר השמירה
 */
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

/**
 * בודקת שערך מסוים לא קיים כבר בעמודה מסוימת בגיליון (למניעת כפילויות).
 * משליכה שגיאה אם הערך כבר קיים.
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 * @category פנימי
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet — אובייקט הגיליון לבדיקה
 * @param {string} columnName — שם העמודה שבה מחפשים
 * @param {string} value — הערך שיש לוודא שאינו קיים
 * @returns {void} אינה מחזירה ערך — משליכה שגיאה אם הערך כבר קיים
 */
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
