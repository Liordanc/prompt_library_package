/**
 * @file שירות בדיקות תקינות לספריית הפרומפטים
 * @description קובץ זה אחראי על בדיקת תקינות המערכת — בדיקה שכל הגיליונות,
 * העמודות, הפרומפטים והקישורים תקינים ולא חסרים.
 *
 * @category ✅ בדיקות תקינות מבנה
 *
 * פונקציות ציבוריות ראשיות:
 * - runFullIntegrityCheck         — מריצה בדיקה מלאה על כל המערכת
 * - validateRequiredSheets        — בודקת קיום גיליונות חיוניים
 * - validateAllSheetSchemas       — בודקת עמודות בכל הגיליונות
 * - validateSheetSchema           — בודקת גיליון ספציפי לפי שם
 * - validateAllPromptRecords      — בודקת תקינות כל שורות הפרומפטים
 * - validateDocLinks              — בודקת קישורי מסמכים
 * - validateCategoryValues        — בודקת ערכי קטגוריות
 * - validateSubcategoryValues     — בודקת ערכי תתי-קטגוריות
 * - validateStatusValues          — בודקת ערכי סטטוס
 * - validatePromptTypeValues      — בודקת ערכי סוג פרומפט
 * - validateToolTargetValues      — בודקת ערכי כלי יעד
 * - validateUniquePromptIds       — בודקת ייחודיות מזהי פרומפטים
 * - validateUniqueDocLinks        — בודקת ייחודיות קישורי מסמכים
 * - writeValidationReportToLogs   — שומרת תוצאות בדיקה ביומן
 *
 * Requires: PROMPT_LIBRARY_SCHEMA
 */

/**
 * מריצה בדיקת תקינות מלאה על כל המערכת ומחזירה דוח מפורט.
 * הפונקציה בודקת גיליונות, עמודות, פרומפטים, קטגוריות, סטטוסים וקישורים —
 * ומחזירה אובייקט מסכם עם תוצאה לכל אזור.
 *
 * ▶️ ניתן להרצה ישירה מהסקריפט
 *
 * @category ציבורי
 * @returns {{timestamp: string, sheets: object, schemas: object, prompts: object, categories: object, subcategories: object, statuses: object, promptTypes: object, toolTargets: object, docLinks: object, ok: boolean}} אובייקט תוצאות מלא הכולל את סטטוס כל בדיקה
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

/**
 * בודקת שכל הגיליונות החיוניים של המערכת קיימים בקובץ Google Sheets.
 * משווה את הגיליונות הקיימים מול הרשימה המוגדרת בסכמה, ומחזירה אילו חסרים.
 *
 * ▶️ ניתן להרצה ישירה מהסקריפט
 *
 * @category ציבורי
 * @returns {{ok: boolean, missingSheets: string[]}} האם כל הגיליונות קיימים, ורשימת השמות החסרים
 */
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

/**
 * בודקת שכל הגיליונות מכילים את כל העמודות הדרושות לפי הסכמה.
 * עוברת על כל הגיליונות שמוגדרים במערכת ומריצה עליהם בדיקת עמודות.
 *
 * ▶️ ניתן להרצה ישירה מהסקריפט
 *
 * @category ציבורי
 * @returns {{ok: boolean, results: object[]}} סטטוס כולל ומערך תוצאות לכל גיליון
 */
function validateAllSheetSchemas() {
  const results = PROMPT_LIBRARY_SCHEMA.sheets.map(sheetConfig => validateSheetSchema(sheetConfig.sheetName));

  return {
    ok: results.every(result => result.ok),
    results
  };
}

/**
 * בודקת את העמודות של גיליון ספציפי לפי שמו — האם כל העמודות הנדרשות קיימות.
 * מחזירה פירוט של מה קיים, מה נדרש, ומה חסר.
 *
 * ▶️ ניתן להרצה ישירה מהסקריפט
 *
 * @category ציבורי
 * @param {string} sheetName — שם הגיליון לבדיקה
 * @returns {{ok: boolean, sheetName: string, missingColumns: string[], existingHeaders: string[], requiredHeaders: string[]}} תוצאת הבדיקה לגיליון הנבחר
 */
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

/**
 * בודקת תקינות כל שורות הפרומפטים בגיליון — האם כל שדות החובה מלאים.
 * עוברת על כל רשומה ומחזירה כמה פרומפטים תקינים וכמה לא.
 *
 * ▶️ ניתן להרצה ישירה מהסקריפט
 *
 * @category ציבורי
 * @returns {{ok: boolean, total: number, invalid: object[]}} סטטוס כולל, מספר שורות, ורשימת הפרומפטים הפגומים
 */
function validateAllPromptRecords() {
  const records = listSheetRecords_("Prompts");
  const results = records.map(record => validatePromptRecordShape_(record));

  return {
    ok: results.every(result => result.ok),
    total: results.length,
    invalid: results.filter(result => !result.ok)
  };
}

/**
 * בודקת שפרומפט בודד מכיל את כל שדות החובה ושהקישור והמועדפים תקינים.
 * פונקציה זו מופעלת על כל רשומה בנפרד במסגרת הבדיקה הכוללת.
 *
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 *
 * @category פנימי
 * @param {object} record — אובייקט פרומפט בודד מהגיליון
 * @returns {{ok: boolean, promptId: string, title: string, errors: string[]}} תוצאת הבדיקה עם רשימת שגיאות אם קיימות
 */
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

  return {
    ok: errors.length === 0,
    promptId: record.Prompt_ID || "",
    title: record.Title || "",
    errors
  };
}

/**
 * בודקת שכל קישורי המסמכים של הפרומפטים פעילים ותקינים — שהמסמך קיים
 * וכולל את מזהה הפרומפט בתוכו.
 *
 * ▶️ ניתן להרצה ישירה מהסקריפט
 *
 * @category ציבורי
 * @returns {{ok: boolean, total: number, invalid: object[]}} סטטוס כולל, מספר קישורים שנבדקו, ורשימת הפגומים
 */
function validateDocLinks() {
  const records = listSheetRecords_("Prompts");
  const results = records.map(record => validateDocLink_(record));

  return {
    ok: results.every(result => result.ok),
    total: results.length,
    invalid: results.filter(result => !result.ok)
  };
}

/**
 * בודקת קישור מסמך של פרומפט בודד — פותחת את המסמך ומוודאת שמזהה הפרומפט מופיע בתוכו.
 * מחזירה שגיאה אם הקישור חסר, לא נגיש, או שהמסמך אינו מכיל את המזהה.
 *
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 *
 * @category פנימי
 * @param {object} record — אובייקט פרומפט הכולל את שדה Full_Doc_Link ו-Prompt_ID
 * @returns {{ok: boolean, promptId: string, documentId?: string, error?: string}} תוצאת הבדיקה לקישור זה
 */
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

/**
 * בודקת שהקטגוריות שהוקלדו בפרומפטים קיימות ברשימה הרשמית שבגיליון Categories.
 * מחזירה אילו פרומפטים מכילים קטגוריה שאינה מוכרת.
 *
 * ▶️ ניתן להרצה ישירה מהסקריפט
 *
 * @category ציבורי
 * @returns {{ok: boolean, invalid: {promptId: string, category: string}[]}} סטטוס הבדיקה ורשימת הפרומפטים עם קטגוריות לא חוקיות
 */
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

/**
 * בודקת שתתי-הקטגוריות שהוקלדו בפרומפטים תואמות את הקטגוריות שלהן.
 * כלומר, שכל תת-קטגוריה שייכת לקטגוריה שנבחרה באותה שורה.
 *
 * ▶️ ניתן להרצה ישירה מהסקריפט
 *
 * @category ציבורי
 * @returns {{ok: boolean, invalid: {promptId: string, category: string, subcategory: string, error: string}[]}} סטטוס הבדיקה ורשימת הפרומפטים עם אי-התאמות
 */
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

/**
 * בודקת שסטטוס כל פרומפט הוא אחד מהערכים המותרים שמוגדרים בסכמה.
 * למשל: טיוטה, פעיל, ארכיון וכו'.
 *
 * ▶️ ניתן להרצה ישירה מהסקריפט
 *
 * @category ציבורי
 * @returns {{ok: boolean, fieldName: string, allowedValues: string[], invalid: object[]}} תוצאת הבדיקה עם רשימת ערכים מותרים ופרומפטים לא תקינים
 */
function validateStatusValues() {
  return validatePromptsControlledValue_("Status", PROMPT_LIBRARY_SCHEMA.controlledValues.status);
}

/**
 * בודקת שסוג כל פרומפט הוא אחד מהערכים המותרים שמוגדרים בסכמה.
 * למשל: מערכת, משתמש, עוזר וכו'.
 *
 * ▶️ ניתן להרצה ישירה מהסקריפט
 *
 * @category ציבורי
 * @returns {{ok: boolean, fieldName: string, allowedValues: string[], invalid: object[]}} תוצאת הבדיקה עם רשימת ערכים מותרים ופרומפטים לא תקינים
 */
function validatePromptTypeValues() {
  return validatePromptsControlledValue_("Prompt_Type", PROMPT_LIBRARY_SCHEMA.controlledValues.promptType);
}

/**
 * בודקת שכלי היעד של כל פרומפט הוא אחד מהערכים המותרים שמוגדרים בסכמה.
 * למשל: ChatGPT, Gemini, Claude וכו'.
 *
 * ▶️ ניתן להרצה ישירה מהסקריפט
 *
 * @category ציבורי
 * @returns {{ok: boolean, fieldName: string, allowedValues: string[], invalid: object[]}} תוצאת הבדיקה עם רשימת ערכים מותרים ופרומפטים לא תקינים
 */
function validateToolTargetValues() {
  return validatePromptsControlledValue_("Tool_Target", PROMPT_LIBRARY_SCHEMA.controlledValues.toolTarget);
}

/**
 * בודקת שדה ספציפי של כל הפרומפטים מול רשימת ערכים מותרים.
 * פונקציה כללית המשמשת את validateStatusValues, validatePromptTypeValues ו-validateToolTargetValues.
 *
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 *
 * @category פנימי
 * @param {string} fieldName — שם השדה לבדיקה (למשל: "Status", "Prompt_Type")
 * @param {string[]} allowedValues — רשימת הערכים החוקיים לשדה זה
 * @returns {{ok: boolean, fieldName: string, allowedValues: string[], invalid: object[]}} תוצאת הבדיקה עם רשימת הפרומפטים שהשדה שלהם לא חוקי
 */
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

/**
 * בודקת שאין שני פרומפטים עם אותו מזהה ייחודי (Prompt_ID).
 * מחזירה את רשימת המזהים שמופיעים יותר מפעם אחת.
 *
 * ▶️ ניתן להרצה ישירה מהסקריפט
 *
 * @category ציבורי
 * @returns {{ok: boolean, duplicates: string[]}} האם כל המזהים ייחודיים, ורשימת הכפולים שנמצאו
 */
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

/**
 * בודקת שאין שני פרומפטים המצביעים לאותו מסמך Google Docs.
 * מחזירה את רשימת הקישורים שמשויכים ליותר מפרומפט אחד.
 *
 * ▶️ ניתן להרצה ישירה מהסקריפט
 *
 * @category ציבורי
 * @returns {{ok: boolean, duplicates: {promptId: string, link: string}[]}} האם כל הקישורים ייחודיים, ורשימת הכפולים שנמצאו
 */
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

/**
 * שומרת את תוצאות הבדיקה ביומן המערכת וגם מחזירה סיכום קצר.
 * מתאימה להרצה ידנית לאחר בדיקת תקינות, לצורך תיעוד ביומן.
 *
 * ▶️ ניתן להרצה ישירה מהסקריפט
 *
 * @category ציבורי
 * @param {object} validationResult — אובייקט תוצאות כפי שמוחזר מ-runFullIntegrityCheck
 * @returns {{ok: boolean, missingSheets: number, invalidSchemas: number, invalidPrompts: number, invalidDocLinks: number, invalidCategories: number, invalidSubcategories: number, invalidStatuses: number, invalidPromptTypes: number, invalidToolTargets: number}} סיכום מספרי של תוצאות הבדיקה
 */
function writeValidationReportToLogs(validationResult) {
  const summary = summarizeValidationResults_(validationResult);

  logAction("VALIDATION_REPORT", "Workbook", SpreadsheetApp.getActiveSpreadsheet().getId(), summary.ok ? "Success" : "Warning", JSON.stringify(summary));

  return summary;
}

/**
 * מסכמת תוצאות בדיקה לאובייקט קצר ומספרי המתאר כמה בעיות נמצאו בכל תחום.
 * משמשת לרישום ביומן ולהצגת סיכום מהיר.
 *
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 *
 * @category פנימי
 * @param {object} results — אובייקט תוצאות מלא מ-runFullIntegrityCheck
 * @returns {{ok: boolean, missingSheets: number, invalidSchemas: number, invalidPrompts: number, invalidDocLinks: number, invalidCategories: number, invalidSubcategories: number, invalidStatuses: number, invalidPromptTypes: number, invalidToolTargets: number}} אובייקט סיכום מספרי
 */
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

/**
 * בודקת אם ערך נתון הוא ריק לחלוטין — null, undefined, או מחרוזת ריקה אחרי חיתוך רווחים.
 * משמשת לבדיקת שדות חובה בכל רחבי הסכמה.
 *
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 *
 * @category פנימי
 * @param {*} value — הערך לבדיקה
 * @returns {boolean} true אם הערך ריק, false אם הוא מכיל תוכן כלשהו
 */
function isBlank_(value) {
  return value === null || value === undefined || String(value).trim() === "";
}

/**
 * בודקת אם כתובת URL נתונה היא קישור תקין של Google Docs.
 * משמשת לאימות שדה Full_Doc_Link בפרומפטים.
 *
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 *
 * @category פנימי
 * @param {string} value — כתובת ה-URL לבדיקה
 * @returns {boolean} true אם הכתובת תואמת את הפורמט של Google Docs, false אחרת
 */
function isGoogleDocsUrl_(value) {
  return /^https:\/\/docs\.google\.com\/document\/d\/[a-zA-Z0-9-_]+/.test(String(value || ""));
}
