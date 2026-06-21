/**
 * @file 02_prompt_library_schema_service.gs
 * @description
 * 🗂️ ניהול מבנה גיליונות — שירות סכמת ספריית הפרומפטים
 *
 * קובץ זה אחראי על בניית המבנה הטכני של ספריית הפרומפטים —
 * יצירת גיליונות, עמודות, גיבויים ורישום פעולות.
 *
 * הוא משתמש בהגדרות שנמצאות בקובץ הסכמה (PROMPT_LIBRARY_SCHEMA)
 * כדי לדעת אילו גיליונות ועמודות נדרשים.
 *
 * פונקציות ציבוריות ראשיות (ניתנות להרצה ישירה):
 * - {@link initializePromptLibrary}  — מכינה את כל הגיליון לעבודה
 * - {@link verifyRequiredSheets}     — בודקת שכל הגיליונות הדרושים קיימים
 * - {@link verifyPromptsSchema}      — בודקת שגיליון הפרומפטים מלא
 * - {@link logAction}                — רושמת פעולה ביומן המערכת
 * - {@link logError}                 — רושמת שגיאה ביומן המערכת
 *
 * Requires: PROMPT_LIBRARY_SCHEMA
 */

/**
 * מכינה את הגיליון לעבודה מלאה.
 *
 * ▶️ ניתן להרצה ישירה מהסקריפט
 *
 * הפונקציה עושה את כל ה"הקמה" הראשונית של ספריית הפרומפטים:
 * יוצרת את כל הגיליונות שחסרים, מסדרת את סדרם, מוסיפה עמודות חסרות,
 * קובעת שורת כותרת קפואה ומוסיפה נתוני פתיחה.
 *
 * @category ציבורי
 * @returns {{ ok: boolean, spreadsheetId: string, spreadsheetUrl: string, timestamp: string }}
 *   אובייקט עם אישור הצלחה, מזהה הגיליון, הקישור אליו וחותמת זמן.
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

/**
 * בודקת שכל הגיליונות שהמערכת צריכה אכן קיימים בגיליון.
 *
 * ▶️ ניתן להרצה ישירה מהסקריפט
 *
 * עוברת על רשימת הגיליונות הנדרשים (כמו Prompts, Categories, Logs)
 * ובודקת אם כל אחד מהם קיים בפועל. מחזירה תוצאה לכל גיליון.
 *
 * @category ציבורי
 * @returns {{ ok: boolean, results: Array<{ sheetName: string, required: boolean, exists: boolean }> }}
 *   אובייקט עם תוצאת הבדיקה הכוללת ורשימה מפורטת לכל גיליון.
 */
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

/**
 * בודקת שגיליון הפרומפטים מכיל את כל העמודות הדרושות.
 *
 * ▶️ ניתן להרצה ישירה מהסקריפט
 *
 * פותחת את גיליון "Prompts" ומשווה את עמודותיו מול הרשימה הנדרשת.
 * אם חסרות עמודות — מחזירה אותן ברשימה.
 *
 * @category ציבורי
 * @returns {{ ok: boolean, sheetName: string, existingHeaders: string[], requiredHeaders: string[], missingColumns: string[] }}
 *   תוצאת הבדיקה: האם הגיליון תקין, אילו עמודות קיימות, אילו נדרשות ואילו חסרות.
 */
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

/**
 * יוצרת גיליונות שחסרים בגיליון האלקטרוני.
 *
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 *
 * עוברת על רשימת הגיליונות הנדרשים בסכמה, ובכל מקרה שגיליון חסר —
 * יוצרת אותו ורושמת את הפעולה ביומן.
 *
 * @category פנימי
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} spreadsheet — הגיליון האלקטרוני הפעיל
 * @param {object} schema — אובייקט הסכמה המכיל את רשימת הגיליונות הנדרשים
 * @returns {void}
 */
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

/**
 * מוסיפה עמודות חסרות לכל גיליון שדורש אותן.
 *
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 *
 * עוברת על כל הגיליונות בסכמה, בודקת אם חסרות עמודות בשורת הכותרת
 * ומוסיפה אותן בסוף. אם הגיליון ריק לחלוטין — יוצרת את שורת הכותרת מאפס.
 *
 * @category פנימי
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} spreadsheet — הגיליון האלקטרוני הפעיל
 * @param {object} schema — אובייקט הסכמה עם הגדרות הגיליונות והעמודות
 * @returns {void}
 */
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

/**
 * קובעת שורת כותרת קפואה בכל גיליון שמוגדר לכך.
 *
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 *
 * שורת כותרת קפואה נשארת גלויה תמיד גם בגלילה למטה,
 * כך שתמיד ניתן לראות מה שם כל עמודה.
 *
 * @category פנימי
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} spreadsheet — הגיליון האלקטרוני הפעיל
 * @param {object} schema — אובייקט הסכמה עם הגדרות הקפאת השורות לכל גיליון
 * @returns {void}
 */
function applyFrozenRows_(spreadsheet, schema) {
  schema.sheets.forEach(sheetConfig => {
    const sheet = spreadsheet.getSheetByName(sheetConfig.sheetName);

    if (!sheet || !sheetConfig.freezeRows) {
      return;
    }

    sheet.setFrozenRows(sheetConfig.freezeRows);
  });
}

/**
 * מסדרת את הגיליונות בסדר המוגדר בסכמה.
 *
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 *
 * מזיזה כל גיליון למיקום המספרי שנקבע לו (sortOrder),
 * כך שהכרטיסיות בתחתית הגיליון יופיעו בסדר הנכון.
 *
 * @category פנימי
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} spreadsheet — הגיליון האלקטרוני הפעיל
 * @param {object} schema — אובייקט הסכמה עם שדה sortOrder לכל גיליון
 * @returns {void}
 */
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

/**
 * מוסיפה שורות ראשוניות חיוניות לגיליונות שצריכים נתוני פתיחה.
 *
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 *
 * לדוגמה — קטגוריות ברירת מחדל בגיליון Categories.
 * הפונקציה בודקת לפני ההוספה אם השורה כבר קיימת, כדי לא ליצור כפילויות.
 *
 * @category פנימי
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} spreadsheet — הגיליון האלקטרוני הפעיל
 * @param {object} schema — אובייקט הסכמה עם שדה seedRows לכל גיליון רלוונטי
 * @returns {void}
 */
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

/**
 * יוצרת עותק גיבוי של הגיליון לפני שינויים גדולים.
 *
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 *
 * אם מצב ה"מוגן" (protectedMode) מופעל בסכמה, הפונקציה מעתיקה את הגיליון
 * כולו לגוגל דרייב ומצמידה לשמו חותמת זמן. כך אפשר לשחזר מצב קודם במידת הצורך.
 *
 * @category פנימי
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} spreadsheet — הגיליון האלקטרוני הפעיל
 * @returns {{ backupFileId: string, backupFileUrl: string } | null}
 *   פרטי קובץ הגיבוי שנוצר, או null אם הגיבוי אינו מופעל.
 */
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

/**
 * שולפת את הגדרות הגיליון לפי שמו מתוך הסכמה.
 *
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 *
 * מחפשת בסכמה (PROMPT_LIBRARY_SCHEMA) את ההגדרות המלאות של גיליון
 * לפי שמו. אם הגיליון לא מוגדר בסכמה — זורקת שגיאה.
 *
 * @category פנימי
 * @param {string} sheetName — שם הגיליון לחיפוש (למשל: "Prompts", "Categories")
 * @returns {object} אובייקט ההגדרות של הגיליון מתוך הסכמה (עמודות, שורות זרע, סדר וכו')
 * @throws {Error} אם לא נמצאה הגדרה לגיליון עם השם שסופק
 */
function getSheetConfig_(sheetName) {
  const config = PROMPT_LIBRARY_SCHEMA.sheets.find(sheet => sheet.sheetName === sheetName);

  if (!config) {
    throw new Error(`Missing sheet config: ${sheetName}`);
  }

  return config;
}

/**
 * קוראת את שמות העמודות (שורת הכותרת) מתוך גיליון נתון.
 *
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 *
 * מחזירה רשימה של הערכים בשורה הראשונה, תוך ניקוי רווחים מיותרים
 * והסרת תאים ריקים.
 *
 * @category פנימי
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet — הגיליון שממנו לקרוא את הכותרות
 * @returns {string[]} רשימת שמות העמודות הקיימים בשורה הראשונה
 */
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

/**
 * קוראת את כל הערכים בעמודה מסוימת (מלבד שורת הכותרת).
 *
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 *
 * מחזירה רשימה של כל הערכים הלא-ריקים בעמודה, החל משורה 2
 * (מדלגת על שורת הכותרת בשורה 1).
 *
 * @category פנימי
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet — הגיליון שממנו לקרוא את הנתונים
 * @param {number} columnNumber — מספר העמודה לקריאה (1 = עמודה ראשונה, 2 = שנייה וכו')
 * @returns {string[]} רשימת הערכים הלא-ריקים בעמודה
 */
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

/**
 * מכינה שורת נתונים להוספה לגיליון — ממלאת תאים ריקים בערכי ברירת מחדל.
 *
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 *
 * הפונקציה ממפה את ערכי השורה לפי סדר העמודות, ואם עמודת תאריך יצירה
 * או עדכון ריקה — ממלאת אותה בתאריך ושעה נוכחיים.
 *
 * @category פנימי
 * @param {Array} seedRow — שורת הנתונים המקורית (מערך של ערכים)
 * @param {string[]} headers — רשימת שמות העמודות לפי הסדר בגיליון
 * @returns {Array} שורה מוכנה להכנסה לגיליון — באורך מלא ועם תאריכים ממולאים
 */
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

/**
 * רושמת פעולה ביומן המערכת (גיליון Logs).
 *
 * ▶️ ניתן להרצה ישירה מהסקריפט
 *
 * בכל פעם שהמערכת מבצעת פעולה חשובה (יצירה, עדכון, מחיקה וכו'),
 * נוצרת שורה חדשה בגיליון Logs עם פרטי הפעולה וחותמת זמן.
 * אם גיליון Logs לא קיים — הוא נוצר אוטומטית.
 *
 * @category ציבורי
 * @param {string} actionType — סוג הפעולה שבוצעה (למשל: "CREATE_SHEET", "SEED_ROWS")
 * @param {string} entityType — סוג הישות עליה בוצעה הפעולה (למשל: "Sheet", "Document")
 * @param {string} entityId — מזהה הישות (שם הגיליון, מזהה המסמך וכו')
 * @param {string} status — תוצאת הפעולה: "Success" או "Error"
 * @param {string} message — הודעה תיאורית קצרה על מה שקרה
 * @returns {string} מזהה ייחודי של שורת הלוג שנוצרה
 */
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

/**
 * רושמת שגיאה ביומן המערכת.
 *
 * ▶️ ניתן להרצה ישירה מהסקריפט
 *
 * קיצור דרך לרישום שגיאות — קוראת ל-logAction עם סטטוס "Error".
 * משמשת בכל מקום שבו קורית שגיאה בלתי צפויה ויש לרשום אותה.
 *
 * @category ציבורי
 * @param {string} actionType — סוג הפעולה שגרמה לשגיאה
 * @param {string} entityType — סוג הישות שנגעה לשגיאה
 * @param {string} entityId — מזהה הישות הרלוונטית
 * @param {string} errorMessage — תיאור השגיאה שקרתה
 * @returns {string} מזהה ייחודי של שורת הלוג שנוצרה
 */
function logError(actionType, entityType, entityId, errorMessage) {
  return logAction(actionType, entityType, entityId, "Error", errorMessage);
}

/**
 * יוצרת מזהה ייחודי לפריט חדש (פרומפט, לוג וכו').
 *
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 *
 * המזהה בנוי מ: קידומת + חותמת זמן מדויקת + 4 ספרות אקראיות.
 * לדוגמה: LOG-20240601123045-3821
 * כך מובטח שכל פריט יקבל מזהה שונה ואחיד.
 *
 * @category פנימי
 * @param {string} prefix — הקידומת שתופיע בתחילת המזהה (למשל: "LOG", "PRM")
 * @returns {string} מזהה ייחודי בפורמט: prefix-yyyyMMddHHmmss-XXXX
 */
function createId_(prefix) {
  const timestamp = Utilities.formatDate(new Date(), PROMPT_LIBRARY_SCHEMA.timezone, "yyyyMMddHHmmss");
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");

  return `${prefix}-${timestamp}-${random}`;
}
