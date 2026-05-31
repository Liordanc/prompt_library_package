/**
 * Schema And Function Map Builder
 * File number: 13
 * Requires:
 * - PROMPT_LIBRARY_SCHEMA
 */

function createSchemaAndFunctionMapSheets() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  createSchemaSheet_(spreadsheet);
  createFunctionMapSheet_(spreadsheet);

  SpreadsheetApp.flush();

  console.log("[SchemaAndFunctionMap] Created SCHEMA and Function_Map sheets");
  Logger.log("[SchemaAndFunctionMap] Created SCHEMA and Function_Map sheets");

  return {
    ok: true,
    createdSheets: ["SCHEMA", "Function_Map"],
    spreadsheetId: spreadsheet.getId(),
    spreadsheetUrl: spreadsheet.getUrl(),
    timestamp: new Date().toISOString()
  };
}

function createSchemaSheet_(spreadsheet) {
  const sheet = getOrCreateSheetForDocs_(spreadsheet, "SCHEMA");

  sheet.clear();

  const headers = [
    "Table_Name",
    "Table_Name_HE",
    "Column_Name",
    "Column_Name_HE",
    "Data_Type",
    "Required",
    "Unique",
    "Editable",
    "Default_Value",
    "Allowed_Values",
    "Validation_Source",
    "Description_HE"
  ];

  const rows = [];

  PROMPT_LIBRARY_SCHEMA.sheets.forEach(sheetConfig => {
    sheetConfig.columns.forEach(column => {
      rows.push([
        sheetConfig.sheetName,
        translateTableName_(sheetConfig.sheetName),
        column.key || "",
        translateColumnName_(column.key || ""),
        column.type || "",
        column.required === true ? "כן" : "לא",
        column.unique === true ? "כן" : "לא",
        column.editable === false ? "לא" : "כן",
        normalizeSchemaValue_(column.defaultValue),
        resolveAllowedValuesForSchema_(column),
        column.validationSource || "",
        describeColumn_(sheetConfig.sheetName, column.key || "")
      ]);
    });
  });

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }

  formatDocumentationSheet_(sheet, headers.length);
}

function createFunctionMapSheet_(spreadsheet) {
  const sheet = getOrCreateSheetForDocs_(spreadsheet, "Function_Map");

  sheet.clear();

  const headers = [
    "Domain_Order",
    "Domain",
    "Domain_HE",
    "Function_Order",
    "Function_Name",
    "Function_Name_HE",
    "When_To_Use_HE",
    "What_It_Does_HE",
    "Expected_Result_HE",
    "Stop_Condition_HE"
  ];

  const rows = getFunctionMapRows_();

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);

  formatDocumentationSheet_(sheet, headers.length);
}

function getFunctionMapRows_() {
  return [
    [
      1,
      "Setup",
      "הקמה ראשונית",
      1,
      "createPromptLibraryMenu",
      "יצירת תפריט הספרייה",
      "משתמשים בה כאשר פותחים את הגיליון ורוצים שיופיע תפריט עבודה מסודר.",
      "יוצרת בגיליון תפריט בשם Prompt Library, עם פעולות התקנה, בדיקות, מיגרציה, טוקן וסוכן.",
      "מופיע תפריט חדש בגוגל שיט.",
      "אם התפריט לא מופיע לאחר רענון הגיליון."
    ],
    [
      1,
      "Setup",
      "הקמה ראשונית",
      2,
      "menuCreateAgentToken",
      "יצירת טוקן לסוכן",
      "משתמשים בה לפני שמחברים סוכן חיצוני דרך Web App.",
      "יוצרת טוקן סודי, שומרת אותו בהגדרות הסקריפט, ומציגה אותו להעתקה.",
      "נוצר טוקן שמתחיל ב־plt ונשמר בפרויקט.",
      "אם הטוקן לא מוצג או לא נשמר."
    ],
    [
      1,
      "Setup",
      "הקמה ראשונית",
      3,
      "installPromptLibraryInfrastructureStrict",
      "התקנה קשיחה של התשתית",
      "משתמשים בה כדי לבנות את מבנה הספרייה בצורה מסודרת ובטוחה.",
      "מריצה את שלבי ההקמה לפי סדר. אם שלב נכשל, היא עוצרת ולא ממשיכה לשלב הבא.",
      "נוצרים הגיליונות, העמודות, נתוני הפתיחה והלוגים.",
      "אם אחת הבדיקות מחזירה שגיאה או ok=false."
    ],
    [
      1,
      "Setup",
      "הקמה ראשונית",
      4,
      "runFullSetupSequence",
      "הרצת רצף הקמה מלא",
      "משתמשים בה כאשר רוצים לבצע הקמה מלאה בלחיצה אחת מתוך התפריט.",
      "יוצרת טוקן אם חסר, מריצה התקנה, בדיקות, בדיקת תקינות ובדיקת מוכנות.",
      "כל שלבי ההקמה מסתיימים בהצלחה.",
      "אם אחד השלבים נכשל, הרצף נעצר ומחזיר באיזה שלב הייתה הבעיה."
    ],
    [
      2,
      "Schema",
      "מבנה גיליונות וסכמה",
      1,
      "initializePromptLibrary",
      "אתחול ספריית הפרומפטים",
      "משתמשים בה כדי להכין את הגיליון לעבודה לפי מבנה הסכמה.",
      "בודקת אילו גיליונות ועמודות חסרים, יוצרת את החסר, מוסיפה נתוני פתיחה וכותבת לוג.",
      "הגיליון מוכן לשימוש בסיסי.",
      "אם אין הרשאות ליצירת גיליונות, עמודות או גיבוי."
    ],
    [
      2,
      "Schema",
      "מבנה גיליונות וסכמה",
      2,
      "verifyRequiredSheets",
      "בדיקת גיליונות חובה",
      "משתמשים בה כדי לוודא שכל הגיליונות הדרושים קיימים.",
      "בודקת אם קיימים הגיליונות Prompts, Categories, Subcategories, Tags, Prompt_Tags, Settings ו־Logs.",
      "כל הגיליונות קיימים.",
      "אם חסר גיליון חובה."
    ],
    [
      2,
      "Schema",
      "מבנה גיליונות וסכמה",
      3,
      "verifyPromptsSchema",
      "בדיקת מבנה גיליון הפרומפטים",
      "משתמשים בה כדי לוודא שגיליון Prompts כולל את כל העמודות הנדרשות.",
      "בודקת את שורת הכותרות של גיליון Prompts ומחזירה אילו עמודות חסרות.",
      "כל העמודות הדרושות קיימות.",
      "אם חסרה עמודת חובה."
    ],
    [
      2,
      "Schema",
      "מבנה גיליונות וסכמה",
      4,
      "createSchemaAndFunctionMapSheets",
      "יצירת גיליונות תיעוד",
      "משתמשים בה כדי ליצור תיעוד פנימי בתוך הגיליון עצמו.",
      "יוצרת גיליון SCHEMA עם כל מבנה הטבלאות וגיליון Function_Map עם מיפוי הפונקציות המרכזיות.",
      "נוצרים שני גיליונות תיעוד מסודרים.",
      "אם חסרה הסכמה המרכזית או שאין הרשאת כתיבה."
    ],
    [
      3,
      "Tests",
      "בדיקות",
      1,
      "runPromptLibrarySetupTest",
      "בדיקת הקמה",
      "משתמשים בה אחרי התקנה כדי לוודא שהמבנה הראשוני נוצר נכון.",
      "מריצה בדיקות בסיסיות על הגיליונות והסכמה.",
      "הבדיקה מחזירה ok=true.",
      "אם אחד מרכיבי ההקמה חסר."
    ],
    [
      3,
      "Tests",
      "בדיקות",
      2,
      "runFirstStableWorkflowTest",
      "בדיקת תהליך ראשון מלא",
      "משתמשים בה כדי לוודא שהתהליך עובד מקצה לקצה.",
      "בודקת יצירת פרומפט בדיקה, יצירת מסמך Google Docs, הוספת שורה לגיליון ובדיקת תקינות.",
      "נוצר פרומפט בדיקה עם מסמך וקישור.",
      "אם המסמך לא נוצר או שהשורה בגיליון לא תקינה."
    ],
    [
      3,
      "Tests",
      "בדיקות",
      3,
      "runFullIntegrityCheck",
      "בדיקת תקינות מלאה",
      "משתמשים בה כדי לבדוק את כל מבנה המערכת אחרי שינויים.",
      "בודקת גיליונות, עמודות, רשומות, קישורים למסמכים, קטגוריות, תתי־קטגוריות וערכים מותרים.",
      "כל הבדיקות עוברות בהצלחה.",
      "אם יש שדות חסרים, קישורים שבורים או ערכים לא חוקיים."
    ],
    [
      3,
      "Tests",
      "בדיקות",
      4,
      "runProductionReadinessCheck",
      "בדיקת מוכנות לשימוש",
      "משתמשים בה לפני שמתחילים לשמור פרומפטים אמיתיים.",
      "בודקת שהמערכת מוכנה לעבודה שוטפת ולא רק להרצה ניסיונית.",
      "המערכת מוכנה לשימוש ראשון.",
      "אם קיימת בעיית מבנה, כפילות או ערך לא תקין."
    ],
    [
      4,
      "Prompt Records",
      "ניהול פרומפטים",
      1,
      "addPrompt",
      "הוספת פרומפט חדש",
      "משתמשים בה כדי להכניס פרומפט חדש לספרייה.",
      "יוצרת מסמך Google Docs לפרומפט, יוצרת תצוגה קצרה, מוסיפה שורה לגיליון ומחברת תגיות.",
      "נוסף פרומפט חדש עם קישור למסמך מלא.",
      "אם חסר שם, תוכן מלא, קטגוריה או אם המסמך לא נוצר."
    ],
    [
      4,
      "Prompt Records",
      "ניהול פרומפטים",
      2,
      "getPromptRecordById",
      "שליפת פרומפט לפי מזהה",
      "משתמשים בה כאשר רוצים לבדוק פרומפט מסוים לפי המזהה שלו.",
      "מחזירה את השורה של הפרומפט מתוך גיליון Prompts.",
      "מוחזרת רשומת הפרומפט.",
      "אם המזהה לא נמצא."
    ],
    [
      4,
      "Prompt Records",
      "ניהול פרומפטים",
      3,
      "findPromptRecords",
      "חיפוש פרומפטים",
      "משתמשים בה כאשר רוצים למצוא פרומפט לפי מילים, תגיות, קטגוריה או תיאור.",
      "מחפשת בתוך שדות הפרומפטים ומחזירה רשומות שמתאימות לחיפוש.",
      "מוחזרת רשימת פרומפטים מתאימים.",
      "אם אין תוצאות או אם גיליון Prompts חסר."
    ],
    [
      4,
      "Prompt Records",
      "ניהול פרומפטים",
      4,
      "markPromptFavorite",
      "סימון פרומפט כמועדף",
      "משתמשים בה כדי לסמן פרומפט חשוב לשימוש מהיר.",
      "משנה את השדה Is_Favorite לערך TRUE.",
      "הפרומפט מסומן כמועדף.",
      "אם המזהה לא נמצא."
    ],
    [
      4,
      "Prompt Records",
      "ניהול פרומפטים",
      5,
      "archivePrompt",
      "העברת פרומפט לארכיון",
      "משתמשים בה כאשר פרומפט כבר לא פעיל אבל עדיין רוצים לשמור אותו.",
      "משנה את סטטוס הפרומפט ל־Archived.",
      "הפרומפט נשמר בארכיון ולא נמחק.",
      "אם המזהה לא נמצא."
    ],
    [
      5,
      "Documents",
      "מסמכי פרומפטים",
      1,
      "createPromptDocument",
      "יצירת מסמך פרומפט",
      "משתמשים בה כאשר מוסיפים פרומפט חדש לספרייה.",
      "יוצרת מסמך Google Docs מלא לפרומפט וממקמת אותו בתיקיית הקטגוריה המתאימה.",
      "נוצר מסמך Google Docs עם שם מסודר.",
      "אם אין הרשאה ליצור מסמך או תיקייה."
    ],
    [
      5,
      "Documents",
      "מסמכי פרומפטים",
      2,
      "populatePromptDocument",
      "מילוי מסמך הפרומפט",
      "משתמשים בה לאחר יצירת המסמך.",
      "מכניסה למסמך כותרת, טבלת זיהוי, שימוש, הפרומפט המלא, הערות וטבלת גרסאות.",
      "המסמך מלא לפי התבנית הקבועה.",
      "אם המסמך לא נפתח או שאין הרשאת עריכה."
    ],
    [
      5,
      "Documents",
      "מסמכי פרומפטים",
      3,
      "validatePromptDocument",
      "בדיקת מסמך פרומפט",
      "משתמשים בה כדי לוודא שמסמך הפרומפט תקין ומחובר לרשומה הנכונה.",
      "בודקת שהמסמך קיים, שיש בו את המזהה, ושיש בו את החלקים המרכזיים.",
      "המסמך תקין ומחובר לפרומפט.",
      "אם הקישור שבור או שהמזהה לא נמצא במסמך."
    ],
    [
      6,
      "Taxonomy",
      "קטגוריות ותגיות",
      1,
      "addCategory",
      "הוספת קטגוריה",
      "משתמשים בה כאשר צריך תחום חדש בספריית הפרומפטים.",
      "מוסיפה קטגוריה חדשה לגיליון הקטגוריות.",
      "נוספת קטגוריה חדשה.",
      "אם שם הקטגוריה כבר קיים."
    ],
    [
      6,
      "Taxonomy",
      "קטגוריות ותגיות",
      2,
      "addSubcategory",
      "הוספת תת־קטגוריה",
      "משתמשים בה כאשר צריך חלוקה פנימית בתוך קטגוריה קיימת.",
      "מוסיפה תת־קטגוריה ומשייכת אותה לקטגוריה ראשית.",
      "נוספת תת־קטגוריה תחת הקטגוריה המתאימה.",
      "אם הקטגוריה הראשית לא קיימת."
    ],
    [
      6,
      "Taxonomy",
      "קטגוריות ותגיות",
      3,
      "syncPromptTags",
      "סנכרון תגיות לפרומפט",
      "משתמשים בה כאשר רוצים לעדכן את רשימת התגיות של פרומפט.",
      "יוצרת תגיות חסרות, מחברת אותן לפרומפט ומסירה חיבורים שכבר לא קיימים.",
      "תגיות הפרומפט מעודכנות.",
      "אם הפרומפט לא נמצא."
    ],
    [
      7,
      "Migration",
      "מיגרציה ובדיקת קובץ קיים",
      1,
      "inspectExistingWorkbook",
      "סריקת הקובץ הקיים",
      "משתמשים בה כדי להבין מה כבר קיים בגיליון לפני שינוי.",
      "מחזירה רשימת גיליונות, מצב הסתרה, מספר שורות, מספר עמודות וכותרות.",
      "מתקבלת תמונת מצב של הקובץ.",
      "אם אין גישה לגיליון."
    ],
    [
      7,
      "Migration",
      "מיגרציה ובדיקת קובץ קיים",
      2,
      "buildMigrationReport",
      "בניית דוח מיגרציה",
      "משתמשים בה לפני שמחליטים מה לשנות בקובץ קיים.",
      "מרכזת בדיקות על מבנה, קטגוריות, תתי־קטגוריות, סטטוסים וסוגי פרומפטים.",
      "מתקבל דוח מצב לקראת שדרוג.",
      "אם אחת הבדיקות נכשלת."
    ],
    [
      8,
      "Web App Agent",
      "סוכן חיצוני",
      1,
      "setAgentGatewayToken",
      "שמירת טוקן לסוכן",
      "משתמשים בה כדי להגדיר את הסיסמה שהסוכן חייב לשלוח בכל פעולה.",
      "שומרת את הטוקן בהגדרות הסקריפט.",
      "הטוקן נשמר ומוכן לשימוש.",
      "אם הטוקן קצר מדי או חסר."
    ],
    [
      8,
      "Web App Agent",
      "סוכן חיצוני",
      2,
      "doGet",
      "בדיקת חיים דרך Web App",
      "משתמשים בה כדי לבדוק שה־Web App פעיל.",
      "מחזירה תשובה בסיסית שמראה שהשירות עובד.",
      "מתקבלת תשובת health check.",
      "אם כתובת ה־Web App לא פעילה."
    ],
    [
      8,
      "Web App Agent",
      "סוכן חיצוני",
      3,
      "doPost",
      "הרצת פעולה דרך Web App",
      "משתמשים בה כאשר סוכן חיצוני צריך להפעיל פעולה מורשית.",
      "מקבלת פעולה, בודקת טוקן, מפעילה את הפעולה ומחזירה תשובת JSON.",
      "הפעולה מתבצעת ומוחזרת תשובה מסודרת.",
      "אם הטוקן שגוי, הפעולה לא מותרת או שהפונקציה נכשלת."
    ],
    [
      9,
      "Menu",
      "תפריט בגיליון",
      1,
      "menuRunFullSetupSequence",
      "הרצת הקמה מלאה מהתפריט",
      "משתמשים בה כאשר רוצים להפעיל את כל רצף ההקמה מתוך הגיליון.",
      "מריצה יצירת טוקן אם חסר, התקנה, בדיקות ומוכנות לשימוש.",
      "המערכת מוכנה לשימוש או נעצרת בשלב שבו נמצאה בעיה.",
      "אם אחד משלבי ההקמה נכשל."
    ],
    [
      9,
      "Menu",
      "תפריט בגיליון",
      2,
      "menuRunGatewayHealthCheckLocal",
      "בדיקת שער הסוכן מתוך הגיליון",
      "משתמשים בה כדי לבדוק את שער הסוכן לפני פרסום או שימוש חיצוני.",
      "מריצה בדיקת חיים מקומית ומחזירה את מצב השירות.",
      "השער מחזיר סטטוס תקין.",
      "אם פונקציית השער אינה זמינה."
    ]
  ];
}

function formatDocumentationSheet_(sheet, columnCount) {
  const lastRow = Math.max(sheet.getLastRow(), 1);

  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, columnCount).setFontWeight("bold");
  sheet.getRange(1, 1, lastRow, columnCount).setWrap(true);
  sheet.autoResizeColumns(1, columnCount);

  if (sheet.getFilter()) {
    sheet.getFilter().remove();
  }

  sheet.getRange(1, 1, lastRow, columnCount).createFilter();
}

function getOrCreateSheetForDocs_(spreadsheet, sheetName) {
  const existing = spreadsheet.getSheetByName(sheetName);

  if (existing) {
    return existing;
  }

  return spreadsheet.insertSheet(sheetName);
}

function translateTableName_(tableName) {
  const map = {
    Prompts: "פרומפטים",
    Categories: "קטגוריות",
    Subcategories: "תתי־קטגוריות",
    Tags: "תגיות",
    Prompt_Tags: "קישור בין פרומפטים לתגיות",
    Settings: "הגדרות",
    Logs: "יומן פעולות"
  };

  return map[tableName] || tableName;
}

function translateColumnName_(columnName) {
  const map = {
    Prompt_ID: "מזהה פרומפט",
    Title: "כותרת",
    Category: "קטגוריה",
    Subcategory: "תת־קטגוריה",
    Description: "תיאור",
    Preview_Text: "תצוגה קצרה",
    Full_Doc_Link: "קישור למסמך המלא",
    Tags: "תגיות",
    Is_Favorite: "מועדף",
    Tool_Target: "כלי יעד",
    Prompt_Type: "סוג פרומפט",
    Status: "סטטוס",
    Version: "גרסה",
    Created_At: "נוצר בתאריך",
    Updated_At: "עודכן בתאריך",
    Source: "מקור",
    Notes: "הערות",
    Category_ID: "מזהה קטגוריה",
    Category_Name: "שם קטגוריה",
    Sort_Order: "סדר הצגה",
    Date_Created: "תאריך יצירה",
    Date_Modified: "תאריך עדכון",
    Subcategory_ID: "מזהה תת־קטגוריה",
    Tag_ID: "מזהה תגית",
    Tag_Name: "שם תגית",
    Tag_Color: "צבע תגית",
    Setting_Key: "שם הגדרה",
    Setting_Value: "ערך הגדרה",
    Log_ID: "מזהה לוג",
    Timestamp: "זמן",
    Action_Type: "סוג פעולה",
    Entity_Type: "סוג פריט",
    Entity_ID: "מזהה פריט",
    Message: "הודעה"
  };

  return map[columnName] || columnName;
}

function normalizeSchemaValue_(value) {
  if (value === null || value === undefined) {
    return "";
  }

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  return String(value);
}

function resolveAllowedValuesForSchema_(column) {
  if (!column.allowedValuesRef) {
    return "";
  }

  const key = String(column.allowedValuesRef).replace("controlledValues.", "");
  const values = PROMPT_LIBRARY_SCHEMA.controlledValues[key];

  if (!values) {
    return "";
  }

  return values.join(", ");
}

function describeColumn_(tableName, columnName) {
  const map = {
    "Prompts.Prompt_ID": "מזהה קבוע של הפרומפט. משתמשים בו כדי למצוא ולעדכן פרומפט בלי להסתמך על השם.",
    "Prompts.Title": "השם הברור של הפרומפט כפי שיופיע בספרייה.",
    "Prompts.Category": "התחום הראשי שאליו הפרומפט שייך.",
    "Prompts.Subcategory": "חלוקה מדויקת יותר בתוך הקטגוריה.",
    "Prompts.Description": "הסבר קצר שמבהיר למה הפרומפט מיועד.",
    "Prompts.Preview_Text": "תצוגה קצרה של הפרומפט בתוך הגיליון. בפרומפט ארוך יוצג רק חלק מהתוכן.",
    "Prompts.Full_Doc_Link": "קישור למסמך Google Docs שבו נמצא הפרומפט המלא.",
    "Prompts.Tags": "מילים קצרות שעוזרות לחפש ולסנן את הפרומפט.",
    "Prompts.Is_Favorite": "סימון האם הפרומפט הוא מועדף.",
    "Prompts.Tool_Target": "הכלי שעבורו הפרומפט מתאים.",
    "Prompts.Prompt_Type": "סוג הפרומפט, למשל תבנית, בדיקה, מחקר או קוד.",
    "Prompts.Status": "מצב הפרומפט: פעיל, טיוטה, מיושן או ארכיון.",
    "Prompts.Version": "הגרסה הנוכחית של הפרומפט.",
    "Prompts.Created_At": "מתי הפרומפט נוצר.",
    "Prompts.Updated_At": "מתי הפרומפט עודכן לאחרונה.",
    "Prompts.Source": "מאיפה הפרומפט הגיע.",
    "Prompts.Notes": "הערות פנימיות לשימוש עתידי.",
    "Categories.Category_ID": "מזהה קבוע של קטגוריה.",
    "Categories.Category_Name": "שם הקטגוריה כפי שיופיע בספרייה.",
    "Categories.Description": "הסבר קצר על מטרת הקטגוריה.",
    "Categories.Sort_Order": "הסדר שבו הקטגוריה תוצג.",
    "Subcategories.Subcategory_ID": "מזהה קבוע של תת־קטגוריה.",
    "Subcategories.Category": "הקטגוריה הראשית שאליה תת־הקטגוריה שייכת.",
    "Subcategories.Subcategory": "שם תת־הקטגוריה.",
    "Tags.Tag_ID": "מזהה קבוע של תגית.",
    "Tags.Tag_Name": "שם התגית.",
    "Tags.Tag_Color": "צבע אופציונלי לתצוגה.",
    "Prompt_Tags.Prompt_ID": "מזהה הפרומפט שמחובר לתגית.",
    "Prompt_Tags.Tag_ID": "מזהה התגית שמחוברת לפרומפט.",
    "Settings.Setting_Key": "שם ההגדרה.",
    "Settings.Setting_Value": "הערך של ההגדרה.",
    "Logs.Log_ID": "מזהה רשומת הלוג.",
    "Logs.Timestamp": "מתי הפעולה נרשמה.",
    "Logs.Action_Type": "שם הפעולה שבוצעה.",
    "Logs.Entity_Type": "סוג הפריט שעליו הפעולה בוצעה.",
    "Logs.Entity_ID": "המזהה של הפריט שעליו הפעולה בוצעה.",
    "Logs.Status": "האם הפעולה הצליחה, נכשלה או הסתיימה באזהרה.",
    "Logs.Message": "פירוט קצר של תוצאת הפעולה."
  };

  return map[`${tableName}.${columnName}`] || "";
}
