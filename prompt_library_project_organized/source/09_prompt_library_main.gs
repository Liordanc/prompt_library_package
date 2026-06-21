/**
 * @file 09_prompt_library_main.gs
 * @category 🚀 נקודות כניסה ראשיות
 *
 * קובץ זה הוא נקודת הכניסה הראשית של המערכת —
 * מכיל את פונקציית הפתיחה של הגיליון ואת תהליכי ההתקנה והבדיקה הראשוניים.
 *
 * פונקציות ציבוריות ראשיות:
 * - `onOpen`                              — פותחת את תפריט הספרייה בפתיחת הגיליון
 * - `menuInitializePromptLibrary`         — פעולת תפריט: אתחול הספרייה
 * - `menuRunSetupTest`                    — פעולת תפריט: הרצת בדיקות הקמה
 * - `menuRunValidation`                   — פעולת תפריט: בדיקת תקינות מלאה
 * - `menuInspectWorkbook`                 — פעולת תפריט: סריקת הגיליון
 * - `menuRunMigrationReport`              — פעולת תפריט: דוח מיגרציה
 * - `menuCreateTestPrompt`                — פעולת תפריט: יצירת פרומפט לבדיקה
 * - `installPromptLibraryInfrastructure`  — התקנה בסיסית של תשתית המערכת
 * - `runFirstStableWorkflowTest`          — בדיקת תהליך מלא מקצה לקצה
 * - `runProductionReadinessCheck`         — בדיקת מוכנות המערכת לשימוש שוטף
 */

/**
 * נקראת אוטומטית כאשר המשתמש פותח את הגיליון.
 * יוצרת את תפריט "Prompt Library" בסרגל הכלים עם כל הפעולות הזמינות.
 *
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @category ציבורי
 * @returns {void} אינה מחזירה ערך — פועלת ישירות על ממשק המשתמש.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Prompt Library")
    .addItem("Initialize Library", "menuInitializePromptLibrary")
    .addItem("Run Setup Test", "menuRunSetupTest")
    .addItem("Run Validation", "menuRunValidation")
    .addSeparator()
    .addItem("Inspect Workbook", "menuInspectWorkbook")
    .addItem("Run Migration Report", "menuRunMigrationReport")
    .addSeparator()
    .addItem("Create Test Prompt", "menuCreateTestPrompt")
    .addToUi();
}

/**
 * פעולת תפריט: מפעילה את אתחול הספרייה ומציגה הודעה קופצת עם התוצאה.
 *
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @category ציבורי
 * @returns {void} אינה מחזירה ערך — מציגה הודעה קופצת למשתמש.
 */
function menuInitializePromptLibrary() {
  runWithUiAlert_("Initialize Library", () => initializePromptLibrary());
}

/**
 * פעולת תפריט: מריצה את בדיקות ההקמה ומציגה הודעה קופצת עם התוצאה.
 *
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @category ציבורי
 * @returns {void} אינה מחזירה ערך — מציגה הודעה קופצת למשתמש.
 */
function menuRunSetupTest() {
  runWithUiAlert_("Run Setup Test", () => runPromptLibrarySetupTest());
}

/**
 * פעולת תפריט: מריצה בדיקת תקינות מלאה ומציגה הודעה קופצת עם התוצאה.
 *
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @category ציבורי
 * @returns {void} אינה מחזירה ערך — מציגה הודעה קופצת למשתמש.
 */
function menuRunValidation() {
  runWithUiAlert_("Run Validation", () => runFullIntegrityCheck());
}

/**
 * פעולת תפריט: סורקת את הגיליון הקיים ומציגה הודעה קופצת עם התוצאה.
 *
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @category ציבורי
 * @returns {void} אינה מחזירה ערך — מציגה הודעה קופצת למשתמש.
 */
function menuInspectWorkbook() {
  runWithUiAlert_("Inspect Workbook", () => inspectExistingWorkbook());
}

/**
 * פעולת תפריט: בונה דוח מיגרציה ומציגה הודעה קופצת עם התוצאה.
 *
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @category ציבורי
 * @returns {void} אינה מחזירה ערך — מציגה הודעה קופצת למשתמש.
 */
function menuRunMigrationReport() {
  runWithUiAlert_("Run Migration Report", () => buildMigrationReport());
}

/**
 * פעולת תפריט: יוצרת פרומפט לבדיקה בגיליון ומציגה הודעה קופצת עם התוצאה.
 *
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @category ציבורי
 * @returns {void} אינה מחזירה ערך — מציגה הודעה קופצת למשתמש.
 */
function menuCreateTestPrompt() {
  runWithUiAlert_("Create Test Prompt", () => runPromptLibraryCreatePromptTest());
}

/**
 * מריצה רצף התקנה בסיסי של תשתית ספריית הפרומפטים.
 * עוברת שלב אחר שלב: אתחול, בדיקות הקמה, בדיקות תקינות וסקירת גיליון.
 *
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @category ציבורי
 * @returns {Object} תוצאת ההתקנה — כולל האם הצליחה, זמן ביצוע, ורשימת שלבים.
 */
function installPromptLibraryInfrastructure() {
  const steps = [];

  steps.push(runInstallStep_("initializePromptLibrary", () => initializePromptLibrary()));
  steps.push(runInstallStep_("runPromptLibrarySetupTest", () => runPromptLibrarySetupTest()));
  steps.push(runInstallStep_("runPromptLibraryValidationTest", () => runPromptLibraryValidationTest()));
  steps.push(runInstallStep_("inspectExistingWorkbook", () => inspectExistingWorkbook()));

  const result = {
    ok: steps.every(step => step.ok === true),
    installedAt: new Date().toISOString(),
    spreadsheetId: SpreadsheetApp.getActiveSpreadsheet().getId(),
    spreadsheetUrl: SpreadsheetApp.getActiveSpreadsheet().getUrl(),
    steps
  };

  logAction("INSTALL_PROMPT_LIBRARY_INFRASTRUCTURE", "Workbook", result.spreadsheetId, result.ok ? "Success" : "Warning", JSON.stringify(buildInstallSummary_(result)));

  return result;
}

/**
 * בודקת תהליך עבודה מלא: הקמה, יצירת פרומפט ובדיקת תקינות — בסדר הנכון.
 * אם שלב אחד נכשל, הבדיקה עוצרת ומחזירה את מקום הכישלון.
 *
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @category ציבורי
 * @returns {Object} תוצאת התהליך המלא — כולל תוצאות כל שלב ואינדיקציה היכן נעצר אם כשל.
 */
function runFirstStableWorkflowTest() {
  const setup = runPromptLibrarySetupTest();

  if (!setup.ok) {
    return {
      ok: false,
      failedAt: "setup",
      setup
    };
  }

  const createPrompt = runPromptLibraryCreatePromptTest();

  if (!createPrompt.ok) {
    return {
      ok: false,
      failedAt: "createPrompt",
      setup,
      createPrompt
    };
  }

  const validation = runPromptLibraryValidationTest();

  return {
    ok: validation.ok === true,
    setup,
    createPrompt,
    validation
  };
}

/**
 * בודקת שהמערכת מוכנה לשימוש שוטף — מריצה את כל בדיקות התקינות הקריטיות.
 * כוללת אימות גיליונות, סכמות, ייחודיות מזהים, קטגוריות, סטטוסים ועוד.
 *
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @category ציבורי
 * @returns {Object} תוצאת הבדיקה — כולל תוצאות כל בדיקת תקינות ומצב כולל.
 */
function runProductionReadinessCheck() {
  const result = {
    generatedAt: new Date().toISOString(),
    requiredSheets: validateRequiredSheets(),
    schemas: validateAllSheetSchemas(),
    uniquePromptIds: validateUniquePromptIds(),
    uniqueDocLinks: validateUniqueDocLinks(),
    categories: validateCategoryValues(),
    subcategories: validateSubcategoryValues(),
    statuses: validateStatusValues(),
    promptTypes: validatePromptTypeValues(),
    toolTargets: validateToolTargetValues()
  };

  result.ok = [
    result.requiredSheets,
    result.schemas,
    result.uniquePromptIds,
    result.uniqueDocLinks,
    result.categories,
    result.subcategories,
    result.statuses,
    result.promptTypes,
    result.toolTargets
  ].every(item => item.ok === true);

  logAction("RUN_PRODUCTION_READINESS_CHECK", "Workbook", SpreadsheetApp.getActiveSpreadsheet().getId(), result.ok ? "Success" : "Warning", JSON.stringify({ ok: result.ok }));

  return result;
}

/**
 * מריצה שלב התקנה בודד ומתעדת את תוצאתו — הצלחה או כישלון.
 * אם השלב נכשל, השגיאה נתפסת ומתועדת מבלי לעצור את שאר השלבים.
 *
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 * @category פנימי
 * @param {string} stepName - שם שלב ההתקנה לצורך זיהוי בתיעוד.
 * @param {Function} fn - הפונקציה שמבצעת את שלב ההתקנה.
 * @returns {Object} אובייקט תוצאת השלב — כולל שם, האם הצליח, זמני התחלה וסיום, ותוצאה או שגיאה.
 */
function runInstallStep_(stepName, fn) {
  const startedAt = new Date();

  try {
    const result = fn();

    return {
      stepName,
      ok: true,
      startedAt: startedAt.toISOString(),
      finishedAt: new Date().toISOString(),
      result
    };
  } catch (error) {
    logError("INSTALL_STEP_FAILED", "InstallStep", stepName, error.message);

    return {
      stepName,
      ok: false,
      startedAt: startedAt.toISOString(),
      finishedAt: new Date().toISOString(),
      error: error.message,
      stack: error.stack || ""
    };
  }
}

/**
 * בונה סיכום קצר של תהליך ההתקנה — כולל רשימת שלבים ומצב כל אחד.
 * משמש לתיעוד ביומן הפעולות בצורה תמציתית.
 *
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 * @category פנימי
 * @param {Object} result - אובייקט תוצאת ההתקנה המלאה כפי שהוחזר מ-`installPromptLibraryInfrastructure`.
 * @returns {Object} סיכום תמציתי הכולל מצב כולל, זמן התקנה ורשימת שלבים עם סטטוס בלבד.
 */
function buildInstallSummary_(result) {
  return {
    ok: result.ok,
    installedAt: result.installedAt,
    steps: result.steps.map(step => ({
      stepName: step.stepName,
      ok: step.ok
    }))
  };
}

/**
 * מריצה פעולה כלשהי ומציגה הודעה קופצת (alert) למשתמש עם תוצאת הביצוע.
 * אם הפעולה הצליחה — מציגה הודעת הצלחה. אם נכשלה — מציגה את הודעת השגיאה.
 *
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 * @category פנימי
 * @param {string} title - כותרת ההודעה הקופצת שתוצג למשתמש.
 * @param {Function} fn - הפעולה שיש לבצע לפני הצגת ההודעה.
 * @returns {*} התוצאה שהוחזרה מהפעולה, או זורקת שגיאה אם הפעולה נכשלה.
 */
function runWithUiAlert_(title, fn) {
  const ui = SpreadsheetApp.getUi();

  try {
    const result = fn();
    const ok = result && result.ok === false ? false : true;

    ui.alert(
      title,
      ok ? "Completed successfully." : "Completed with warnings. Check Logs.",
      ui.ButtonSet.OK
    );

    return result;
  } catch (error) {
    logError("MENU_ACTION_FAILED", "MenuAction", title, error.message);

    ui.alert(title, `Failed: ${error.message}`, ui.ButtonSet.OK);

    throw error;
  }
}
