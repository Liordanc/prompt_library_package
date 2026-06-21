/**
 * 📝 ניהול פרומפטים — שירות הפרומפטים של ספריית הפרומפטים
 *
 * קובץ זה אחראי על כל הפעולות הקשורות לפרומפטים עצמם —
 * הוספה, עדכון, חיפוש, ארכיון וסימון מועדפים.
 *
 * תלויות: PROMPT_LIBRARY_SCHEMA
 *
 * פונקציות ציבוריות ראשיות:
 * - addPrompt            — מוסיפה פרומפט חדש לספרייה
 * - addPromptRecord      — מוסיפה שורה לגיליון Prompts בלבד
 * - updatePromptRecord   — מעדכנת שדות בפרומפט קיים
 * - getPromptRecordById  — שולפת פרומפט לפי מזהה
 * - findPromptRecords    — מחפשת פרומפטים לפי מילות חיפוש
 * - markPromptFavorite   — מסמנת פרומפט כמועדף
 * - unmarkPromptFavorite — מבטלת סימון מועדף
 * - togglePromptFavorite — הופכת את מצב המועדף
 * - getFavoritePrompts   — מחזירה את כל הפרומפטים המועדפים
 * - archivePrompt        — מעבירה פרומפט לסטטוס ארכיון
 * - deprecatePrompt      — מסמנת פרומפט כמיושן
 * - restorePrompt        — מחזירה פרומפט לסטטוס פעיל
 * - validatePromptRecord — בודקת שכל שדות החובה מלאים
 * - generatePreviewText  — יוצרת תצוגה קצרה מהפרומפט המלא
 * - truncatePreviewText  — קוצצת טקסט לאורך מקסימלי
 */

/**
 * מוסיפה פרומפט חדש לספרייה — יוצרת מסמך, שורה בגיליון ומחברת תגיות.
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @category ציבורי
 * @param {Object} promptData — אובייקט עם פרטי הפרומפט החדש (כותרת, תוכן, תגיות וכו')
 * @returns {Object} הרשומה המלאה של הפרומפט שנוצר
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

/**
 * מוסיפה שורה לגיליון Prompts בלבד — ללא יצירת מסמך.
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @category ציבורי
 * @param {Object} promptData — אובייקט עם נתוני הפרומפט לשמירה בגיליון
 * @returns {Object} אובייקט עם ערכי השורה שנוספה
 */
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

/**
 * מעדכנת שדות בפרומפט קיים לפי המזהה שלו.
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @category ציבורי
 * @param {string} promptId — מזהה ייחודי של הפרומפט לעדכון
 * @param {Object} updates — אובייקט עם השדות החדשים לעדכון
 * @returns {Object} הרשומה המעודכנת של הפרומפט
 */
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

/**
 * שולפת פרומפט מהגיליון לפי המזהה הייחודי שלו.
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @category ציבורי
 * @param {string} promptId — המזהה הייחודי של הפרומפט
 * @returns {Object|null} אובייקט עם נתוני הפרומפט, או null אם לא נמצא
 */
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

/**
 * מחפשת פרומפטים בגיליון לפי מילת חיפוש חופשית.
 * החיפוש מתבצע בכל השדות: כותרת, תיאור, תגיות, קטגוריה ועוד.
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @category ציבורי
 * @param {string} query — מילת החיפוש (אפשר להשאיר ריק כדי לקבל את כולם)
 * @returns {Object[]} רשימת פרומפטים התואמים לחיפוש
 */
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

/**
 * מסמנת פרומפט כמועדף לפי מזהה.
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @category ציבורי
 * @param {string} promptId — המזהה הייחודי של הפרומפט לסימון
 * @returns {Object} הרשומה המעודכנת של הפרומפט
 */
function markPromptFavorite(promptId) {
  return updatePromptRecord(promptId, { Is_Favorite: true });
}

/**
 * מבטלת את סימון המועדף של פרומפט לפי מזהה.
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @category ציבורי
 * @param {string} promptId — המזהה הייחודי של הפרומפט
 * @returns {Object} הרשומה המעודכנת של הפרומפט
 */
function unmarkPromptFavorite(promptId) {
  return updatePromptRecord(promptId, { Is_Favorite: false });
}

/**
 * הופכת את מצב המועדף של פרומפט — אם מועדף הופך ללא-מועדף, ולהיפך.
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @category ציבורי
 * @param {string} promptId — המזהה הייחודי של הפרומפט
 * @returns {Object} הרשומה המעודכנת של הפרומפט
 */
function togglePromptFavorite(promptId) {
  const record = getPromptRecordById(promptId);

  if (!record) {
    throw new Error(`Prompt not found: ${promptId}`);
  }

  const currentState = parseBoolean_(record.Is_Favorite);

  return updatePromptRecord(promptId, { Is_Favorite: !currentState });
}

/**
 * מחזירה את כל הפרומפטים המסומנים כמועדפים.
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @category ציבורי
 * @returns {Object[]} רשימת הפרומפטים המועדפים
 */
function getFavoritePrompts() {
  return findPromptRecords("").filter(record => parseBoolean_(record.Is_Favorite));
}

/**
 * מעבירה פרומפט לסטטוס ארכיון — הפרומפט עדיין קיים אך אינו פעיל.
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @category ציבורי
 * @param {string} promptId — המזהה הייחודי של הפרומפט לארכיון
 * @returns {Object} הרשומה המעודכנת של הפרומפט
 */
function archivePrompt(promptId) {
  return updatePromptRecord(promptId, { Status: "Archived" });
}

/**
 * מסמנת פרומפט כמיושן — מתאים לפרומפטים שהיו בשימוש אך אינם רלוונטיים עוד.
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @category ציבורי
 * @param {string} promptId — המזהה הייחודי של הפרומפט
 * @returns {Object} הרשומה המעודכנת של הפרומפט
 */
function deprecatePrompt(promptId) {
  return updatePromptRecord(promptId, { Status: "Deprecated" });
}

/**
 * מחזירה פרומפט שהיה בארכיון או מיושן חזרה לסטטוס פעיל.
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @category ציבורי
 * @param {string} promptId — המזהה הייחודי של הפרומפט לשחזור
 * @returns {Object} הרשומה המעודכנת של הפרומפט
 */
function restorePrompt(promptId) {
  return updatePromptRecord(promptId, { Status: "Active" });
}

/**
 * בודקת שכל שדות החובה של פרומפט מלאים ותקינים.
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @category ציבורי
 * @param {string} promptId — המזהה הייחודי של הפרומפט לבדיקה
 * @returns {{ ok: boolean, promptId: string, missingFields: string[] }} תוצאת הבדיקה: האם עבר, ורשימת שדות חסרים
 */
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

/**
 * יוצרת גרסה מקוצרת של הפרומפט המלא לצורך תצוגה בגיליון.
 * אורך התצוגה נקבע לפי הגדרות הסכמה.
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @category ציבורי
 * @param {string} fullPromptText — הטקסט המלא של הפרומפט
 * @returns {string} טקסט מקוצר מוכן לתצוגה
 */
function generatePreviewText(fullPromptText) {
  const limit = Number(PROMPT_LIBRARY_SCHEMA.settings.previewTextLimit || 1500);
  return truncatePreviewText(fullPromptText, limit);
}

/**
 * קוצצת טקסט לאורך מקסימלי מוגדר ומוסיפה "..." בסוף אם נחתך.
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @category ציבורי
 * @param {string} text — הטקסט לקיצוץ
 * @param {number} limit — מספר התווים המקסימלי המותר
 * @returns {string} הטקסט לאחר קיצוץ (עם "…" אם נחתך)
 */
function truncatePreviewText(text, limit) {
  const normalized = String(text || "").trim();

  if (normalized.length <= limit) {
    return normalized;
  }

  return `${normalized.slice(0, limit).trim()}…`;
}

/**
 * ממלאת ערכי ברירת מחדל לנתוני פרומפט חדש ומחזירה אובייקט מנורמל.
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 * @category פנימי
 * @param {Object} promptData — נתוני הפרומפט המקוריים שהתקבלו מהמשתמש
 * @returns {Object} אובייקט פרומפט מלא עם כל השדות הנדרשים וערכי ברירת מחדל
 */
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
    Notes: String(promptData.Notes || "").trim()
  };
}

/**
 * שולפת את הערך המתאים לשדה מסוים מנתוני הפרומפט, לפי שם עמודת הגיליון.
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 * @category פנימי
 * @param {Object} promptData — אובייקט נתוני הפרומפט
 * @param {string} header — שם העמודה שצריך לשלוף
 * @returns {*} הערך המתאים לאותו שדה (מחרוזת, בוליאני, מערך וכו')
 */
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

/**
 * ממירה רשימת תגיות לפורמט אחיד — מערך של מחרוזות נקיות.
 * מקבלת גם מערך וגם מחרוזת מופרדת בפסיקים.
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 * @category פנימי
 * @param {string|string[]|null} tags — רשימת תגיות: מערך, מחרוזת מופרדת בפסיקים, או ריק
 * @returns {string[]} מערך מחרוזות מנורמלות של התגיות
 */
function normalizeTags_(tags) {
  if (!tags) {
    return [];
  }

  if (Array.isArray(tags)) {
    return tags.map(tag => String(tag || "").trim()).filter(tag => tag.length > 0);
  }

  return String(tags).split(",").map(tag => tag.trim()).filter(tag => tag.length > 0);
}

/**
 * מוצאת את מספר השורה של פרומפט בגיליון לפי המזהה שלו.
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 * @category פנימי
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet — אובייקט הגיליון לחיפוש
 * @param {string} promptId — המזהה הייחודי של הפרומפט
 * @returns {number|null} מספר השורה (מ-1), או null אם לא נמצא
 */
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

/**
 * בונה אובייקט נתונים מרשימת כותרות עמודות ורשימת ערכים מתאימה.
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 * @category פנימי
 * @param {string[]} headers — רשימת שמות העמודות (כותרות)
 * @param {*[]} row — רשימת הערכים המתאימים לכל עמודה
 * @returns {Object} אובייקט שמפות כל כותרת לערך המתאים לה
 */
function objectFromHeaders_(headers, row) {
  return headers.reduce((record, header, index) => {
    record[header] = row[index];
    return record;
  }, {});
}

/**
 * ממירה ערך שונים לבוליאני (אמת/שקר), כולל תמיכה בעברית ("כן"/"לא").
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 * @category פנימי
 * @param {*} value — הערך לבדיקה: יכול להיות בוליאני, מחרוזת ("true"/"כן") או כל ערך אחר
 * @returns {boolean} true אם הערך מייצג "כן" / אמת, false בכל מקרה אחר
 */
function parseBoolean_(value) {
  if (value === true) {
    return true;
  }

  if (typeof value === "string") {
    return value.toLowerCase() === "true" || value === "כן";
  }

  return false;
}
