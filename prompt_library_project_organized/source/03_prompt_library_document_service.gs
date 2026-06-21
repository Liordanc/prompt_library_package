/**
 * @file 03_prompt_library_document_service.gs
 * @description
 * 📄 ניהול מסמכים — שירות מסמכי ספריית הפרומפטים
 *
 * קובץ זה אחראי על יצירת ועדכון מסמכי Google Docs לכל פרומפט בספרייה.
 *
 * כל פרומפט שנוצר מקבל מסמך Google Docs משלו, הממוקם בתיקיית הקטגוריה
 * המתאימה בגוגל דרייב. המסמך כולל כותרת, פרטי זיהוי, תוכן הפרומפט,
 * הערות שימוש והיסטוריית גרסאות.
 *
 * פונקציות ציבוריות ראשיות (ניתנות להרצה ישירה):
 * - {@link createPromptDocument}    — יוצרת מסמך Docs חדש לפרומפט
 * - {@link populatePromptDocument}  — ממלאת מסמך קיים בתוכן הפרומפט
 * - {@link updatePromptDocument}    — מעדכנת תוכן קיים במסמך
 * - {@link validatePromptDocument}  — בודקת תקינות מסמך הפרומפט
 *
 * Requires: PROMPT_LIBRARY_SCHEMA
 */

/**
 * יוצרת מסמך Google Docs חדש לפרומפט ומעבירה אותו לתיקייה המתאימה בדרייב.
 *
 * ▶️ ניתן להרצה ישירה מהסקריפט
 *
 * הפונקציה יוצרת מסמך חדש בשם הכולל את הקטגוריה, הכותרת והגרסה,
 * מעבירה אותו לתיקיית הקטגוריה הנכונה בגוגל דרייב,
 * וממלאת אותו בכל הפרטים של הפרומפט.
 *
 * @category ציבורי
 * @param {object} promptData — אובייקט עם פרטי הפרומפט (Category, Title, Version, Content וכו')
 * @returns {{ documentId: string, documentUrl: string, documentName: string }}
 *   מזהה המסמך שנוצר, הקישור אליו ושמו המלא.
 */
function createPromptDocument(promptData) {
  const folder = getOrCreatePromptFolder_(promptData.Category || "כללי");
  const documentName = buildPromptDocumentName_(promptData);
  const document = DocumentApp.create(documentName);
  const file = DriveApp.getFileById(document.getId());

  folder.addFile(file);
  removeFileFromRoot_(file);

  populatePromptDocument(document.getId(), promptData);

  logAction(
    "CREATE_PROMPT_DOCUMENT",
    "Document",
    document.getId(),
    "Success",
    `Prompt document created: ${documentName}`
  );

  return {
    documentId: document.getId(),
    documentUrl: document.getUrl(),
    documentName
  };
}

/**
 * ממלאת מסמך Google Docs קיים בכל פרטי הפרומפט.
 *
 * ▶️ ניתן להרצה ישירה מהסקריפט
 *
 * מוחקת את תוכן המסמך ובונה אותו מחדש עם כל הסקציות:
 * כותרת, זיהוי, מטרה, גוף הפרומפט, הערות שימוש והיסטוריית גרסאות.
 *
 * @category ציבורי
 * @param {string} documentId — מזהה מסמך Google Docs שיש למלא
 * @param {object} promptData — אובייקט עם כל פרטי הפרומפט
 * @returns {{ documentId: string, documentUrl: string }}
 *   מזהה המסמך שמולא וכתובת ה-URL שלו.
 */
function populatePromptDocument(documentId, promptData) {
  const document = DocumentApp.openById(documentId);
  const body = document.getBody();

  body.clear();

  appendDocumentTitle_(body, promptData.Title);
  appendIdentificationSection_(body, promptData);
  appendUseCaseSection_(body, promptData);
  appendCurrentPromptSection_(body, promptData);
  appendUsageNotesSection_(body, promptData);
  appendVersionHistorySection_(body, promptData);

  document.saveAndClose();

  return {
    documentId,
    documentUrl: document.getUrl()
  };
}

/**
 * מעדכנת תוכן קיים במסמך הפרומפט — גוף הפרומפט והערות שימוש.
 *
 * ▶️ ניתן להרצה ישירה מהסקריפט
 *
 * מאתרת את הפרומפט לפי מזהה, פותחת את המסמך המקושר אליו,
 * ומחליפה את הסקציות הרלוונטיות בתוכן החדש שסופק.
 *
 * @category ציבורי
 * @param {string} promptId — מזהה הפרומפט שיש לעדכן
 * @param {string} newPromptContent — התוכן החדש של הפרומפט
 * @param {string} [notes] — הערות שימוש מעודכנות (אופציונלי)
 * @returns {{ promptId: string, documentId: string, documentUrl: string }}
 *   מזהה הפרומפט, מזהה המסמך וכתובת ה-URL שלו לאחר העדכון.
 */
function updatePromptDocument(promptId, newPromptContent, notes) {
  const record = getPromptRecordById(promptId);

  if (!record) {
    throw new Error(`Prompt not found: ${promptId}`);
  }

  const documentId = extractDocumentIdFromUrl_(record.Full_Doc_Link);
  const document = DocumentApp.openById(documentId);
  const body = document.getBody();

  replaceSectionContent_(body, "Current Prompt", newPromptContent);

  if (notes) {
    replaceSectionContent_(body, "Usage Notes", notes);
  }

  document.saveAndClose();

  logAction(
    "UPDATE_PROMPT_DOCUMENT",
    "Prompt",
    promptId,
    "Success",
    "Prompt document updated"
  );

  return {
    promptId,
    documentId,
    documentUrl: document.getUrl()
  };
}

/**
 * בודקת שמסמך הפרומפט תקין ומכיל את כל הסקציות הנדרשות.
 *
 * ▶️ ניתן להרצה ישירה מהסקריפט
 *
 * מוצאת את המסמך המקושר לפרומפט ובודקת שכל הסקציות הנדרשות נמצאות בו
 * (Identification, Use Case, Current Prompt, Usage Notes, Version History).
 * גם בודקת שמזהה הפרומפט מופיע בגוף המסמך.
 *
 * @category ציבורי
 * @param {string} promptId — מזהה הפרומפט לבדיקה
 * @returns {{ ok: boolean, promptId: string, documentId: string, errors: string[] }}
 *   תוצאת הבדיקה: האם המסמך תקין, ואם לא — רשימת הבעיות שנמצאו.
 */
function validatePromptDocument(promptId) {
  const record = getPromptRecordById(promptId);

  if (!record) {
    return {
      ok: false,
      promptId,
      errors: [`Prompt record not found: ${promptId}`]
    };
  }

  if (!record.Full_Doc_Link) {
    return {
      ok: false,
      promptId,
      errors: ["Full_Doc_Link is missing"]
    };
  }

  const documentId = extractDocumentIdFromUrl_(record.Full_Doc_Link);
  const document = DocumentApp.openById(documentId);
  const bodyText = document.getBody().getText();

  const requiredSections = [
    "Identification",
    "Use Case",
    "Current Prompt",
    "Usage Notes",
    "Version History"
  ];

  const missingSections = requiredSections.filter(section => !bodyText.includes(section));
  const errors = [];

  if (!bodyText.includes(String(record.Prompt_ID))) {
    errors.push("Prompt_ID not found in document");
  }

  if (missingSections.length > 0) {
    errors.push(`Missing sections: ${missingSections.join(", ")}`);
  }

  return {
    ok: errors.length === 0,
    promptId,
    documentId,
    errors
  };
}

/**
 * בונה את שם המסמך בפורמט [קטגוריה] כותרת - גרסה.
 *
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 *
 * לדוגמה: [קוד ופיתוח] כתיבת בדיקות - v1.0
 * משתמשת בערכי ברירת מחדל אם קטגוריה, כותרת או גרסה חסרים.
 *
 * @category פנימי
 * @param {object} promptData — אובייקט עם שדות Category, Title ו-Version
 * @returns {string} שם המסמך בפורמט המלא
 */
function buildPromptDocumentName_(promptData) {
  const category = String(promptData.Category || "כללי").trim();
  const title = String(promptData.Title || "Untitled Prompt").trim();
  const version = String(promptData.Version || PROMPT_LIBRARY_SCHEMA.settings.defaultVersion).trim();

  return `[${category}] ${title} - ${version}`;
}

/**
 * מוסיפה כותרת ראשית למסמך (כותרת H1).
 *
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 *
 * מוסיפה את כותרת הפרומפט בפסקה מעוצבת כ-Heading 1 בראש המסמך.
 * אם לא סופקה כותרת — כותבת "Untitled Prompt".
 *
 * @category פנימי
 * @param {GoogleAppsScript.Document.Body} body — גוף המסמך שאליו מוסיפים את הכותרת
 * @param {string} title — כותרת הפרומפט
 * @returns {void}
 */
function appendDocumentTitle_(body, title) {
  body.appendParagraph(title || "Untitled Prompt")
    .setHeading(DocumentApp.ParagraphHeading.HEADING1);
}

/**
 * מוסיפה טבלת פרטי זיהוי למסמך.
 *
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 *
 * יוצרת סקציה "Identification" עם טבלה המכילה את הפרטים הבסיסיים של הפרומפט:
 * מזהה, כותרת, קטגוריה, תת-קטגוריה, גרסה, סטטוס ותאריך עדכון.
 *
 * @category פנימי
 * @param {GoogleAppsScript.Document.Body} body — גוף המסמך
 * @param {object} promptData — אובייקט עם פרטי הפרומפט לזיהוי
 * @returns {void}
 */
function appendIdentificationSection_(body, promptData) {
  body.appendParagraph("Identification")
    .setHeading(DocumentApp.ParagraphHeading.HEADING2);

  const rows = [
    ["Field", "Value"],
    ["Prompt_ID", promptData.Prompt_ID || ""],
    ["Title", promptData.Title || ""],
    ["Category", promptData.Category || ""],
    ["Subcategory", promptData.Subcategory || ""],
    ["Current_Version", promptData.Version || PROMPT_LIBRARY_SCHEMA.settings.defaultVersion],
    ["Status", promptData.Status || PROMPT_LIBRARY_SCHEMA.settings.defaultPromptStatus],
    ["Updated_At", formatDateTime_(promptData.Updated_At || new Date())]
  ];

  body.appendTable(rows);
}

/**
 * מוסיפה סקציית "מטרת הפרומפט" למסמך.
 *
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 *
 * יוצרת כותרת "Use Case" ומתחתיה את תיאור המטרה של הפרומפט —
 * להסביר למה הוא נוצר ואיפה הוא שימושי.
 *
 * @category פנימי
 * @param {GoogleAppsScript.Document.Body} body — גוף המסמך
 * @param {object} promptData — אובייקט הפרומפט, שממנו נשלף שדה Description
 * @returns {void}
 */
function appendUseCaseSection_(body, promptData) {
  body.appendParagraph("Use Case")
    .setHeading(DocumentApp.ParagraphHeading.HEADING2);

  body.appendParagraph(promptData.Description || "");
}

/**
 * מוסיפה את גוף הפרומפט המלא למסמך.
 *
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 *
 * יוצרת סקציה "Current Prompt" ומכניסה לתוכה את הטקסט המלא של הפרומפט.
 * מחפשת את תוכן הפרומפט בשדות: Full_Prompt, Content, ואז Preview_Text.
 *
 * @category פנימי
 * @param {GoogleAppsScript.Document.Body} body — גוף המסמך
 * @param {object} promptData — אובייקט הפרומפט עם שדות Full_Prompt / Content / Preview_Text
 * @returns {void}
 */
function appendCurrentPromptSection_(body, promptData) {
  body.appendParagraph("Current Prompt")
    .setHeading(DocumentApp.ParagraphHeading.HEADING2);

  const promptText = promptData.Full_Prompt || promptData.Content || promptData.Preview_Text || "";
  body.appendParagraph(promptText);
}

/**
 * מוסיפה סקציית הערות שימוש למסמך.
 *
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 *
 * יוצרת כותרת "Usage Notes" ומתחתיה את ההערות שמסבירות איך להשתמש בפרומפט נכון,
 * אילו פרמטרים לשנות, ומה לשים לב אליו.
 *
 * @category פנימי
 * @param {GoogleAppsScript.Document.Body} body — גוף המסמך
 * @param {object} promptData — אובייקט הפרומפט, שממנו נשלף שדה Notes
 * @returns {void}
 */
function appendUsageNotesSection_(body, promptData) {
  body.appendParagraph("Usage Notes")
    .setHeading(DocumentApp.ParagraphHeading.HEADING2);

  body.appendParagraph(promptData.Notes || "");
}

/**
 * מוסיפה טבלת היסטוריית גרסאות למסמך.
 *
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 *
 * יוצרת סקציה "Version History" עם טבלה שמתעדת את גרסת הפרומפט הנוכחית —
 * כולל תאריך יצירה, תיאור השינוי וסטטוס.
 *
 * @category פנימי
 * @param {GoogleAppsScript.Document.Body} body — גוף המסמך
 * @param {object} promptData — אובייקט הפרומפט עם שדות Version, Created_At ו-Status
 * @returns {void}
 */
function appendVersionHistorySection_(body, promptData) {
  body.appendParagraph("Version History")
    .setHeading(DocumentApp.ParagraphHeading.HEADING2);

  const rows = [
    ["Version", "Date", "Change Summary", "Status"],
    [
      promptData.Version || PROMPT_LIBRARY_SCHEMA.settings.defaultVersion,
      formatDateTime_(promptData.Created_At || new Date()),
      "Initial version",
      promptData.Status || PROMPT_LIBRARY_SCHEMA.settings.defaultPromptStatus
    ]
  ];

  body.appendTable(rows);
}

/**
 * מחליפה את תוכן סקציה מסוימת במסמך בתוכן חדש.
 *
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 *
 * מאתרת את הכותרת של הסקציה הרצויה, מוחקת את כל התוכן שאחריה
 * (עד לסקציה הבאה), ומכניסה במקומה את הטקסט החדש.
 *
 * @category פנימי
 * @param {GoogleAppsScript.Document.Body} body — גוף המסמך שבו יש להחליף תוכן
 * @param {string} sectionTitle — שם הסקציה לעדכון (למשל: "Current Prompt")
 * @param {string} newContent — התוכן החדש שיוכנס לסקציה
 * @returns {void}
 * @throws {Error} אם הסקציה עם הכותרת הנתונה לא נמצאה במסמך
 */
function replaceSectionContent_(body, sectionTitle, newContent) {
  const paragraphs = body.getParagraphs();
  let sectionIndex = -1;
  let nextSectionIndex = -1;

  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i];
    const text = paragraph.getText().trim();

    if (text === sectionTitle) {
      sectionIndex = body.getChildIndex(paragraph);
      continue;
    }

    if (sectionIndex !== -1 && paragraph.getHeading() === DocumentApp.ParagraphHeading.HEADING2) {
      nextSectionIndex = body.getChildIndex(paragraph);
      break;
    }
  }

  if (sectionIndex === -1) {
    throw new Error(`Section not found: ${sectionTitle}`);
  }

  const deleteFrom = sectionIndex + 1;
  const deleteTo = nextSectionIndex === -1 ? body.getNumChildren() - 1 : nextSectionIndex - 1;

  for (let i = deleteTo; i >= deleteFrom; i--) {
    body.removeChild(body.getChild(i));
  }

  body.insertParagraph(deleteFrom, String(newContent || ""));
}

/**
 * מוצאת או יוצרת את תיקיית הספרייה הראשית "Prompt Library" בגוגל דרייב.
 *
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 *
 * בודקת אם קיימת תיקייה בשם "Prompt Library" בדרייב.
 * אם כן — מחזירה אותה. אם לא — יוצרת אותה.
 *
 * @category פנימי
 * @returns {GoogleAppsScript.Drive.Folder} אובייקט תיקיית הספרייה הראשית
 */
function getOrCreatePromptRootFolder_() {
  const rootFolderName = "Prompt Library";
  const folders = DriveApp.getFoldersByName(rootFolderName);

  if (folders.hasNext()) {
    return folders.next();
  }

  return DriveApp.createFolder(rootFolderName);
}

/**
 * מוצאת או יוצרת תיקיית קטגוריה בתוך תיקיית הספרייה הראשית.
 *
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 *
 * לכל קטגוריה (למשל "קוד ופיתוח") קיימת תיקייה משלה בדרייב.
 * הפונקציה מאתרת אותה, ואם לא קיימת — יוצרת אותה.
 *
 * @category פנימי
 * @param {string} categoryName — שם הקטגוריה בעברית (למשל: "קוד ופיתוח", "כללי")
 * @returns {GoogleAppsScript.Drive.Folder} אובייקט תיקיית הקטגוריה
 */
function getOrCreatePromptFolder_(categoryName) {
  const rootFolder = getOrCreatePromptRootFolder_();
  const folderName = resolveCategoryFolderName_(categoryName);
  const folders = rootFolder.getFoldersByName(folderName);

  if (folders.hasNext()) {
    return folders.next();
  }

  return rootFolder.createFolder(folderName);
}

/**
 * ממירה שם קטגוריה בעברית לשם תיקיית דרייב מסודרת עם מספור.
 *
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 *
 * כדי שהתיקיות יופיעו בסדר קבוע ומסודר בדרייב,
 * לכל קטגוריה יש שם תיקייה עם מספר קידומת.
 * לדוגמה: "קוד ופיתוח" → "01 - קוד ופיתוח".
 * קטגוריה לא מוכרת תמופה לתיקייה "08 - כללי".
 *
 * @category פנימי
 * @param {string} categoryName — שם הקטגוריה בעברית
 * @returns {string} שם תיקיית הדרייב המתאימה, כולל מספור קידומת
 */
function resolveCategoryFolderName_(categoryName) {
  const map = {
    "קוד ופיתוח": "01 - קוד ופיתוח",
    "עיצוב וממשק": "02 - עיצוב וממשק",
    "מסמכים וסיכומים": "03 - מסמכים וסיכומים",
    "הוראה ולמידה": "04 - הוראה ולמידה",
    "מחקר ואימות": "05 - מחקר ואימות",
    "ניהול עבודה": "06 - ניהול עבודה",
    "כתיבת פרומפטים": "07 - כתיבת פרומפטים",
    "כללי": "08 - כללי",
    "ארכיון": "99 - ארכיון"
  };

  return map[categoryName] || "08 - כללי";
}

/**
 * מסירה קובץ מתיקיית השורש של גוגל דרייב.
 *
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 *
 * כאשר יוצרים מסמך חדש, הוא מופיע אוטומטית ב-"My Drive" (שורש הדרייב).
 * פונקציה זו מסירה אותו משם לאחר שהועבר לתיקיית הקטגוריה הנכונה.
 * אם ההסרה נכשלת — מתועדת שגיאה ביומן.
 *
 * @category פנימי
 * @param {GoogleAppsScript.Drive.File} file — אובייקט הקובץ שיש להסיר מהשורש
 * @returns {void}
 */
function removeFileFromRoot_(file) {
  try {
    DriveApp.getRootFolder().removeFile(file);
  } catch (error) {
    logError("REMOVE_FILE_FROM_ROOT", "File", file.getId(), error.message);
  }
}

/**
 * שולפת את מזהה המסמך (Document ID) מתוך כתובת URL של Google Docs.
 *
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 *
 * כתובת URL של Google Docs נראית כך:
 * https://docs.google.com/document/d/DOCUMENT_ID/edit
 * הפונקציה שולפת את DOCUMENT_ID מתוכה.
 * אם הקלט כבר הוא מזהה בלבד (ולא URL) — מחזירה אותו כמות שהוא.
 *
 * @category פנימי
 * @param {string} url — כתובת URL של מסמך Google Docs, או מזהה המסמך ישירות
 * @returns {string} מזהה המסמך המחולץ
 * @throws {Error} אם לא ניתן לחלץ מזהה תקני מהכתובת שסופקה
 */
function extractDocumentIdFromUrl_(url) {
  const text = String(url || "");
  const match = text.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);

  if (match && match[1]) {
    return match[1];
  }

  if (/^[a-zA-Z0-9-_]+$/.test(text)) {
    return text;
  }

  throw new Error("Invalid Google Docs URL or document ID");
}

/**
 * מפרמטת תאריך ושעה לפורמט קריא ואחיד.
 *
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 *
 * ממירה אובייקט תאריך (Date) לטקסט בפורמט yyyy-MM-dd HH:mm:ss,
 * לפי אזור הזמן שמוגדר בסכמת הספרייה.
 * לדוגמה: 2024-06-01 14:30:00
 *
 * @category פנימי
 * @param {Date|string} value — תאריך כאובייקט Date או כמחרוזת טקסט
 * @returns {string} התאריך והשעה בפורמט: yyyy-MM-dd HH:mm:ss
 */
function formatDateTime_(value) {
  const date = value instanceof Date ? value : new Date(value);

  return Utilities.formatDate(
    date,
    PROMPT_LIBRARY_SCHEMA.timezone,
    "yyyy-MM-dd HH:mm:ss"
  );
}
