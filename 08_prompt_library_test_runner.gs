/**
 * @file 08_prompt_library_test_runner.gs
 * @category 🧪 הרצת בדיקות
 *
 * קובץ זה מריץ בדיקות אוטומטיות כדי לוודא שהמערכת עובדת נכון לאחר התקנה או שינויים.
 * הוא בודק את הגדרות הגיליון, יצירת פרומפטים, קטגוריות ותגיות, תקינות הנתונים ותהליכי מיגרציה.
 *
 * פונקציות ציבוריות ראשיות:
 * - `runPromptLibrarySetupTest`                    — בדיקות הקמה בסיסיות לאחר ההתקנה
 * - `runPromptLibraryCreatePromptTest`             — בדיקת יצירת פרומפט מלאה
 * - `runPromptLibraryTaxonomyTest`                 — בדיקת קטגוריות, תתי-קטגוריות ותגיות
 * - `runPromptLibraryValidationTest`               — בדיקות תקינות על כל הנתונים
 * - `runPromptLibraryMigrationInspectionTest`      — בדיקת פונקציות סקירה ומיגרציה
 * - `runPromptLibraryFullTestSuite`                — הרצת כל הבדיקות ביחד (ללא יצירת פרומפט)
 * - `runPromptLibraryFullTestSuiteWithPromptCreation` — הרצת כל הבדיקות כולל יצירת פרומפט בדיקה
 */

/**
 * מריצה בדיקות הקמה בסיסיות כדי לוודא שהמערכת הוגדרה כהלכה לאחר ההתקנה.
 * הבדיקה כוללת: אתחול הספרייה, אימות גיליונות ועמודות, ובדיקת סכמות.
 *
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @category ציבורי
 * @returns {Object} סיכום תוצאות הבדיקה — כולל מספר בדיקות שעברו ונכשלו.
 */
function runPromptLibrarySetupTest() {
  const results = [];

  results.push(runTest_("initializePromptLibrary", () => initializePromptLibrary()));
  results.push(runTest_("verifyRequiredSheets", () => verifyRequiredSheets()));
  results.push(runTest_("verifyPromptsSchema", () => verifyPromptsSchema()));
  results.push(runTest_("validateRequiredSheets", () => validateRequiredSheets()));
  results.push(runTest_("validateAllSheetSchemas", () => validateAllSheetSchemas()));

  return buildTestSummary_("runPromptLibrarySetupTest", results);
}

/**
 * בודקת את כל תהליך יצירת פרומפט — מהתחלה ועד הסוף.
 * יוצרת פרומפט לבדיקה ומאמתת שהוא נשמר, קריא ותקין.
 *
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @category ציבורי
 * @returns {Object} סיכום תוצאות הבדיקה — כולל מצב כל שלב ביצירת הפרומפט.
 */
function runPromptLibraryCreatePromptTest() {
  const testPromptData = {
    Title: "Test Prompt - Infrastructure Validation",
    Category: "כללי",
    Subcategory: "לבדיקה",
    Description: "Infrastructure validation prompt record",
    Full_Prompt: "This is a test prompt created by the Prompt Library infrastructure validation flow.",
    Tags: ["test", "infrastructure"],
    Is_Favorite: false,
    Tool_Target: "ChatGPT",
    Prompt_Type: "General",
    Status: "Draft",
    Source: "Test Runner",
    Notes: "Created by runPromptLibraryCreatePromptTest()"
  };

  const results = [];

  results.push(runTest_("addPrompt", () => addPrompt(testPromptData)));

  const createdPrompt = results[0].result;

  if (createdPrompt && createdPrompt.Prompt_ID) {
    results.push(runTest_("getPromptRecordById", () => getPromptRecordById(createdPrompt.Prompt_ID)));
    results.push(runTest_("validatePromptRecord", () => validatePromptRecord(createdPrompt.Prompt_ID)));
    results.push(runTest_("validatePromptDocument", () => validatePromptDocument(createdPrompt.Prompt_ID)));
    results.push(runTest_("getPromptTags", () => getPromptTags(createdPrompt.Prompt_ID)));
  }

  return buildTestSummary_("runPromptLibraryCreatePromptTest", results);
}

/**
 * בודקת שקטגוריות, תתי-קטגוריות ותגיות עובדים כראוי בספרייה.
 * מאמתת שניתן לרשום, לאתר ולאמת קטגוריות קיימות.
 *
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @category ציבורי
 * @returns {Object} סיכום תוצאות בדיקת הטקסונומיה — כולל מצב כל בדיקת קטגוריה.
 */
function runPromptLibraryTaxonomyTest() {
  const results = [];

  results.push(runTest_("listCategories", () => listCategories()));
  results.push(runTest_("listTags", () => listTags()));
  results.push(runTest_("getCategoryByName", () => getCategoryByName("כללי")));
  results.push(runTest_("getSubcategoriesByCategory", () => getSubcategoriesByCategory("כללי")));
  results.push(runTest_("validateCategoryPair", () => validateCategoryPair("כללי", "לבדיקה")));

  return buildTestSummary_("runPromptLibraryTaxonomyTest", results);
}

/**
 * מריצה את כל בדיקות התקינות על הנתונים בגיליון.
 * בודקת גיליונות, סכמות, פרומפטים, קטגוריות, סטטוסים ועוד.
 *
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @category ציבורי
 * @returns {Object} סיכום תוצאות כל בדיקות התקינות.
 */
function runPromptLibraryValidationTest() {
  const results = [];

  results.push(runTest_("validateRequiredSheets", () => validateRequiredSheets()));
  results.push(runTest_("validateAllSheetSchemas", () => validateAllSheetSchemas()));
  results.push(runTest_("validateAllPromptRecords", () => validateAllPromptRecords()));
  results.push(runTest_("validateCategoryValues", () => validateCategoryValues()));
  results.push(runTest_("validateSubcategoryValues", () => validateSubcategoryValues()));
  results.push(runTest_("validateStatusValues", () => validateStatusValues()));
  results.push(runTest_("validatePromptTypeValues", () => validatePromptTypeValues()));
  results.push(runTest_("validateToolTargetValues", () => validateToolTargetValues()));
  results.push(runTest_("validateUniquePromptIds", () => validateUniquePromptIds()));
  results.push(runTest_("validateUniqueDocLinks", () => validateUniqueDocLinks()));

  return buildTestSummary_("runPromptLibraryValidationTest", results);
}

/**
 * בודקת שפונקציות הסקירה והמיגרציה של הגיליון עובדות כראוי.
 * כוללת סקירת גיליון קיים, סימון גיליונות מיושנים ובניית דוח מיגרציה.
 *
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @category ציבורי
 * @returns {Object} סיכום תוצאות בדיקת המיגרציה והסקירה.
 */
function runPromptLibraryMigrationInspectionTest() {
  const results = [];

  results.push(runTest_("inspectExistingWorkbook", () => inspectExistingWorkbook()));
  results.push(runTest_("markDeprecatedSheetsForReview", () => markDeprecatedSheetsForReview()));
  results.push(runTest_("buildMigrationReport", () => buildMigrationReport()));

  return buildTestSummary_("runPromptLibraryMigrationInspectionTest", results);
}

/**
 * מריצה את כל חבילות הבדיקה ביחד — ללא יצירת פרומפט חדש.
 * כוללת בדיקות הקמה, טקסונומיה, תקינות ומיגרציה.
 *
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @category ציבורי
 * @returns {Object} סיכום כולל של כל חבילות הבדיקה שהורצו.
 */
function runPromptLibraryFullTestSuite() {
  const suites = [];

  suites.push(runPromptLibrarySetupTest());
  suites.push(runPromptLibraryTaxonomyTest());
  suites.push(runPromptLibraryValidationTest());
  suites.push(runPromptLibraryMigrationInspectionTest());

  const summary = {
    suiteName: "runPromptLibraryFullTestSuite",
    ok: suites.every(suite => suite.ok === true),
    startedAt: new Date().toISOString(),
    suites
  };

  logAction("RUN_FULL_TEST_SUITE", "Workbook", SpreadsheetApp.getActiveSpreadsheet().getId(), summary.ok ? "Success" : "Warning", JSON.stringify(buildCompactTestSummary_(summary)));

  return summary;
}

/**
 * מריצה את כל הבדיקות, כולל יצירת פרומפט בדיקה אמיתי בגיליון.
 * מתאימה לבדיקה מקיפה של כל מחזור החיים של פרומפט.
 *
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @category ציבורי
 * @returns {Object} סיכום כולל של כל הבדיקות, כולל יצירת פרומפט.
 */
function runPromptLibraryFullTestSuiteWithPromptCreation() {
  const suites = [];

  suites.push(runPromptLibrarySetupTest());
  suites.push(runPromptLibraryCreatePromptTest());
  suites.push(runPromptLibraryTaxonomyTest());
  suites.push(runPromptLibraryValidationTest());

  const summary = {
    suiteName: "runPromptLibraryFullTestSuiteWithPromptCreation",
    ok: suites.every(suite => suite.ok === true),
    startedAt: new Date().toISOString(),
    suites
  };

  logAction("RUN_FULL_TEST_SUITE_WITH_PROMPT_CREATION", "Workbook", SpreadsheetApp.getActiveSpreadsheet().getId(), summary.ok ? "Success" : "Warning", JSON.stringify(buildCompactTestSummary_(summary)));

  return summary;
}

/**
 * מריצה פונקציית בדיקה בודדת ומתעדת את התוצאה — הצלחה או כישלון.
 * אם הפונקציה נכשלת, השגיאה נתפסת ומתועדת מבלי לעצור את שאר הבדיקות.
 *
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 * @category פנימי
 * @param {string} testName - שם הבדיקה לצורך זיהוי בתוצאות.
 * @param {Function} fn - הפונקציה שיש להריץ כחלק מהבדיקה.
 * @returns {Object} אובייקט תוצאה הכולל: שם הבדיקה, האם עברה, זמן התחלה וסיום, ותוצאה או שגיאה.
 */
function runTest_(testName, fn) {
  const startedAt = new Date();

  try {
    const result = fn();

    return {
      testName,
      ok: true,
      startedAt: startedAt.toISOString(),
      finishedAt: new Date().toISOString(),
      result
    };
  } catch (error) {
    logError("TEST_FAILED", "Test", testName, error.message);

    return {
      testName,
      ok: false,
      startedAt: startedAt.toISOString(),
      finishedAt: new Date().toISOString(),
      error: error.message,
      stack: error.stack || ""
    };
  }
}

/**
 * בונה סיכום תוצאות לחבילת בדיקות שלמה ומתעד אותו ביומן הפעולות.
 * מרכז את כל תוצאות הבדיקות ומחשב כמה עברו וכמה נכשלו.
 *
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 * @category פנימי
 * @param {string} suiteName - שם חבילת הבדיקות לזיהוי בתיעוד.
 * @param {Object[]} results - מערך תוצאות בדיקות בודדות כפי שהוחזרו מ-`runTest_`.
 * @returns {Object} סיכום החבילה הכולל: שם, האם עברה, מספר כולל, עברו ונכשלו.
 */
function buildTestSummary_(suiteName, results) {
  const summary = {
    suiteName,
    ok: results.every(result => result.ok === true),
    total: results.length,
    passed: results.filter(result => result.ok === true).length,
    failed: results.filter(result => result.ok !== true).length,
    results
  };

  logAction("RUN_TEST_SUITE", "TestSuite", suiteName, summary.ok ? "Success" : "Warning", JSON.stringify({ total: summary.total, passed: summary.passed, failed: summary.failed }));

  return summary;
}

/**
 * בונה סיכום קצר ומקוצר של תוצאות חבילת הבדיקות — ללא פרטי בדיקות בודדות.
 * משמש לתיעוד ביומן הפעולות מבלי לכלול נתונים עודפים.
 *
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 * @category פנימי
 * @param {Object} summary - אובייקט סיכום מלא כפי שהוחזר מ-`runPromptLibraryFullTestSuite` או דומה.
 * @returns {Object} אובייקט מקוצר הכולל שם, מצב הצלחה, ורשימת חבילות עם סטטיסטיקות בלבד.
 */
function buildCompactTestSummary_(summary) {
  return {
    suiteName: summary.suiteName,
    ok: summary.ok,
    suites: summary.suites.map(suite => ({
      suiteName: suite.suiteName,
      ok: suite.ok,
      total: suite.total,
      passed: suite.passed,
      failed: suite.failed
    }))
  };
}
