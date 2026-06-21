/**
 * @file 12_prompt_library_menu_controller.gs
 * @category 🖥️ תפריט וממשק משתמש בגיליון
 *
 * קובץ זה שולט על התפריט של הספרייה בגוגל שיט ומטפל
 * בכל הפעולות שהמשתמש יכול להפעיל ממנו.
 *
 * פונקציות ציבוריות ראשיות:
 * - onOpen                    — נקראת אוטומטית בפתיחת הגיליון ויוצרת את התפריט
 * - createPromptLibraryMenu   — בונה את תפריט Prompt Library עם כל תת-התפריטים
 * - menuRunFullSetupSequence  — מריצה את כל רצף ההקמה בלחיצה אחת
 * - menuCreateAgentToken      — יוצרת טוקן סודי חדש לסוכן ומציגה אותו
 *
 * דרישות: שירותי Prompt Library קיימים.
 */

/**
 * נקראת אוטומטית על ידי גוגל שיט בכל פעם שהגיליון נפתח, ויוצרת את תפריט הספרייה.
 * @category ציבורי
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @returns {void} אינה מחזירה ערך
 */
function onOpen() {
  createPromptLibraryMenu();
}

/**
 * בונה את תפריט "Prompt Library" בגיליון עם כל תת-התפריטים, הפריטים והפרידות.
 * @category ציבורי
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @returns {void} אינה מחזירה ערך
 */
function createPromptLibraryMenu() {
  SpreadsheetApp.getUi()
    .createMenu("Prompt Library")
    .addSubMenu(
      SpreadsheetApp.getUi()
        .createMenu("Setup")
        .addItem("1. Create / Reset Agent Token", "menuCreateAgentToken")
        .addItem("2. Run Strict Installation", "menuRunStrictInstallation")
        .addItem("3. Run Setup Test", "menuRunSetupTest")
        .addItem("4. Run First Stable Workflow Test", "menuRunFirstStableWorkflowTest")
        .addItem("5. Run Production Readiness Check", "menuRunProductionReadinessCheck")
    )
    .addSubMenu(
      SpreadsheetApp.getUi()
        .createMenu("Validation")
        .addItem("Run Full Integrity Check", "menuRunFullIntegrityCheck")
        .addItem("Validate Required Sheets", "menuValidateRequiredSheets")
        .addItem("Validate All Schemas", "menuValidateAllSchemas")
    )
    .addSubMenu(
      SpreadsheetApp.getUi()
        .createMenu("Migration")
        .addItem("Inspect Workbook", "menuInspectWorkbook")
        .addItem("Build Migration Report", "menuBuildMigrationReport")
    )
    .addSubMenu(
      SpreadsheetApp.getUi()
        .createMenu("Web App Agent")
        .addItem("Create / Reset Agent Token", "menuCreateAgentToken")
        .addItem("Show Agent Token Status", "menuShowAgentTokenStatus")
        .addItem("Run Gateway Health Check Local", "menuRunGatewayHealthCheckLocal")
    )
    .addSeparator()
    .addItem("Create Test Prompt", "menuCreateTestPrompt")
    .addItem("Run Full Setup Sequence", "menuRunFullSetupSequence")
    .addToUi();
}

/**
 * פעולת תפריט: יוצרת טוקן סודי חדש לסוכן החיצוני ומציגה אותו למשתמש לשמירה.
 * @category ציבורי
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @returns {void} אינה מחזירה ערך — מציגה חלון קופץ עם הטוקן
 */
function menuCreateAgentToken() {
  runMenuAction_("Create / Reset Agent Token", () => {
    const token = generateAgentToken_();
    const result = setAgentGatewayToken(token);

    showLongMessage_(
      "Agent Token Created",
      [
        "A new agent token was created and stored in Script Properties.",
        "Copy this token now and store it securely.",
        "",
        token
      ].join("\n")
    );

    return result;
  });
}

/**
 * פעולת תפריט: מציגה האם יש טוקן פעיל שמור בהגדרות הסקריפט.
 * @category ציבורי
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @returns {void} אינה מחזירה ערך — מציגה חלון קופץ עם סטטוס הטוקן
 */
function menuShowAgentTokenStatus() {
  runMenuAction_("Agent Token Status", () => {
    const token = PropertiesService
      .getScriptProperties()
      .getProperty("PROMPT_LIBRARY_AGENT_TOKEN");

    const result = {
      ok: Boolean(token),
      exists: Boolean(token),
      length: token ? token.length : 0
    };

    showLongMessage_(
      "Agent Token Status",
      JSON.stringify(result, null, 2)
    );

    return result;
  });
}

/**
 * פעולת תפריט: מריצה התקנה קשיחה של תשתית הספרייה.
 * @category ציבורי
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @returns {void} אינה מחזירה ערך — מציגה תוצאה בחלון קופץ
 */
function menuRunStrictInstallation() {
  runMenuAction_("Run Strict Installation", () => installPromptLibraryInfrastructureStrict());
}

/**
 * פעולת תפריט: מריצה בדיקות הקמה כדי לוודא שהמבנה הראשוני נוצר נכון.
 * @category ציבורי
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @returns {void} אינה מחזירה ערך — מציגה תוצאה בחלון קופץ
 */
function menuRunSetupTest() {
  runMenuAction_("Run Setup Test", () => runPromptLibrarySetupTest());
}

/**
 * פעולת תפריט: מריצה בדיקת תהליך מלאה מקצה לקצה.
 * @category ציבורי
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @returns {void} אינה מחזירה ערך — מציגה תוצאה בחלון קופץ
 */
function menuRunFirstStableWorkflowTest() {
  runMenuAction_("Run First Stable Workflow Test", () => runFirstStableWorkflowTest());
}

/**
 * פעולת תפריט: בודקת שהמערכת מוכנה לשימוש שוטף ולא רק לניסיון.
 * @category ציבורי
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @returns {void} אינה מחזירה ערך — מציגה תוצאה בחלון קופץ
 */
function menuRunProductionReadinessCheck() {
  runMenuAction_("Run Production Readiness Check", () => runProductionReadinessCheck());
}

/**
 * פעולת תפריט: מריצה בדיקת תקינות מלאה של כל מבנה המערכת.
 * @category ציבורי
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @returns {void} אינה מחזירה ערך — מציגה תוצאה בחלון קופץ
 */
function menuRunFullIntegrityCheck() {
  runMenuAction_("Run Full Integrity Check", () => runFullIntegrityCheck());
}

/**
 * פעולת תפריט: בודקת שכל הגיליונות הנדרשים קיימים בקובץ.
 * @category ציבורי
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @returns {void} אינה מחזירה ערך — מציגה תוצאה בחלון קופץ
 */
function menuValidateRequiredSheets() {
  runMenuAction_("Validate Required Sheets", () => validateRequiredSheets());
}

/**
 * פעולת תפריט: בודקת שמבנה העמודות בכל הגיליונות תואם את הסכמה המוגדרת.
 * @category ציבורי
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @returns {void} אינה מחזירה ערך — מציגה תוצאה בחלון קופץ
 */
function menuValidateAllSchemas() {
  runMenuAction_("Validate All Schemas", () => validateAllSheetSchemas());
}

/**
 * פעולת תפריט: סורקת את הגיליון ומחזירה תמונת מצב של מה שקיים בו.
 * @category ציבורי
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @returns {void} אינה מחזירה ערך — מציגה תוצאה בחלון קופץ
 */
function menuInspectWorkbook() {
  runMenuAction_("Inspect Workbook", () => inspectExistingWorkbook());
}

/**
 * פעולת תפריט: בונה דוח מיגרציה שמסכם מה קיים בגיליון לפני שינוי.
 * @category ציבורי
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @returns {void} אינה מחזירה ערך — מציגה תוצאה בחלון קופץ
 */
function menuBuildMigrationReport() {
  runMenuAction_("Build Migration Report", () => buildMigrationReport());
}

/**
 * פעולת תפריט: מריצה בדיקת חיים מקומית לשער הסוכן החיצוני.
 * @category ציבורי
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @returns {void} אינה מחזירה ערך — מציגה תוצאה בחלון קופץ
 */
function menuRunGatewayHealthCheckLocal() {
  runMenuAction_("Gateway Health Check Local", () => agentHealthCheck_());
}

/**
 * פעולת תפריט: יוצרת פרומפט לבדיקה כדי לוודא שהמערכת עובדת.
 * @category ציבורי
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @returns {void} אינה מחזירה ערך — מציגה תוצאה בחלון קופץ
 */
function menuCreateTestPrompt() {
  runMenuAction_("Create Test Prompt", () => runPromptLibraryCreatePromptTest());
}

/**
 * פעולת תפריט: מריצה את כל רצף ההקמה של הספרייה בלחיצה אחת.
 * @category ציבורי
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @returns {void} אינה מחזירה ערך — מציגה תוצאה בחלון קופץ
 */
function menuRunFullSetupSequence() {
  runMenuAction_("Run Full Setup Sequence", () => runFullSetupSequence_());
}

/**
 * מריצה את כל שלבי ההקמה בסדר קבוע, ועוצרת מיד אם אחד מהשלבים נכשל.
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 * @category פנימי
 * @returns {Object} אובייקט עם ok, stopped, ורשימת השלבים שבוצעו
 */
function runFullSetupSequence_() {
  const steps = [
    {
      name: "Create agent token if missing",
      fn: () => ensureAgentTokenExists_()
    },
    {
      name: "Strict installation",
      fn: () => assertMenuStepOk_(installPromptLibraryInfrastructureStrict())
    },
    {
      name: "Setup test",
      fn: () => assertMenuStepOk_(runPromptLibrarySetupTest())
    },
    {
      name: "First stable workflow test",
      fn: () => assertMenuStepOk_(runFirstStableWorkflowTest())
    },
    {
      name: "Full integrity check",
      fn: () => assertMenuStepOk_(runFullIntegrityCheck())
    },
    {
      name: "Production readiness check",
      fn: () => assertMenuStepOk_(runProductionReadinessCheck())
    }
  ];

  const executedSteps = [];

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const startedAt = new Date();

    console.log(`[MenuSetup] Starting: ${step.name}`);
    Logger.log(`[MenuSetup] Starting: ${step.name}`);

    try {
      const result = step.fn();

      executedSteps.push({
        order: i + 1,
        name: step.name,
        ok: true,
        startedAt: startedAt.toISOString(),
        finishedAt: new Date().toISOString(),
        result
      });

      console.log(`[MenuSetup] Completed: ${step.name}`);
      Logger.log(`[MenuSetup] Completed: ${step.name}`);
    } catch (error) {
      executedSteps.push({
        order: i + 1,
        name: step.name,
        ok: false,
        startedAt: startedAt.toISOString(),
        finishedAt: new Date().toISOString(),
        error: error.message
      });

      console.error(`[MenuSetup] Failed: ${step.name} — ${error.message}`);
      Logger.log(`[MenuSetup] Failed: ${step.name} — ${error.message}`);
      logError("FULL_SETUP_SEQUENCE_FAILED", "SetupStep", step.name, error.message);

      return {
        ok: false,
        stopped: true,
        failedAt: step.name,
        steps: executedSteps
      };
    }
  }

  return {
    ok: true,
    stopped: false,
    steps: executedSteps
  };
}

/**
 * בודקת שיש טוקן שמור בהגדרות הסקריפט, ויוצרת אחד חדש אם חסר.
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 * @category פנימי
 * @returns {Object} אובייקט עם ok, created (האם נוצר חדש), וטקסט הסבר
 */
function ensureAgentTokenExists_() {
  const existingToken = PropertiesService
    .getScriptProperties()
    .getProperty("PROMPT_LIBRARY_AGENT_TOKEN");

  if (existingToken) {
    return {
      ok: true,
      created: false,
      message: "Agent token already exists"
    };
  }

  const token = generateAgentToken_();
  setAgentGatewayToken(token);

  showLongMessage_(
    "Agent Token Created",
    [
      "A new agent token was created and stored in Script Properties.",
      "Copy this token now and store it securely.",
      "",
      token
    ].join("\n")
  );

  return {
    ok: true,
    created: true,
    tokenLength: token.length
  };
}

/**
 * יוצרת טוקן סודי ייחודי חדש בפורמט plt_[תאריך]_[uuid]_[מספר אקראי].
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 * @category פנימי
 * @returns {string} הטוקן הסודי שנוצר
 */
function generateAgentToken_() {
  const uuid = Utilities.getUuid().replace(/-/g, "");
  const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMddHHmmss");
  const random = Math.floor(Math.random() * 1000000000).toString().padStart(9, "0");

  return `plt_${timestamp}_${uuid}_${random}`;
}

/**
 * מריצה פעולת תפריט עם תיעוד ביומן ומציגה את התוצאה למשתמש בחלון קופץ.
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 * @category פנימי
 * @param {string} title - שם הפעולה לתצוגה בכותרת החלון ובלוג
 * @param {Function} fn - הפונקציה שיש להריץ
 * @returns {*} תוצאת הפונקציה שרצה
 */
function runMenuAction_(title, fn) {
  const ui = SpreadsheetApp.getUi();
  const startedAt = new Date();

  console.log(`[PromptLibraryMenu] Starting: ${title}`);
  Logger.log(`[PromptLibraryMenu] Starting: ${title}`);

  try {
    const result = fn();
    const ok = !(result && result.ok === false);

    console.log(`[PromptLibraryMenu] Completed: ${title}`);
    Logger.log(`[PromptLibraryMenu] Completed: ${title}`);

    logAction(
      "MENU_ACTION",
      "Menu",
      title,
      ok ? "Success" : "Warning",
      JSON.stringify(compactMenuResult_(result))
    );

    showLongMessage_(
      title,
      JSON.stringify({
        ok,
        startedAt: startedAt.toISOString(),
        finishedAt: new Date().toISOString(),
        result: compactMenuResult_(result)
      }, null, 2)
    );

    return result;
  } catch (error) {
    console.error(`[PromptLibraryMenu] Failed: ${title} — ${error.message}`);
    Logger.log(`[PromptLibraryMenu] Failed: ${title} — ${error.message}`);

    try {
      logError("MENU_ACTION_FAILED", "Menu", title, error.message);
    } catch (ignored) {}

    ui.alert(
      title,
      `Failed: ${error.message}`,
      ui.ButtonSet.OK
    );

    throw error;
  }
}

/**
 * בודקת שתוצאת שלב בהקמה תקינה, וזורקת שגיאה אם ok=false.
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 * @category פנימי
 * @param {Object} result - תוצאת השלב שיש לבדוק
 * @returns {Object} התוצאה המקורית אם היא תקינה
 */
function assertMenuStepOk_(result) {
  if (result && result.ok === false) {
    throw new Error(JSON.stringify(result));
  }

  return result;
}

/**
 * מצמצמת תוצאה גדולה לנתונים העיקריים בלבד, להצגה קומפקטית בחלון הקופץ.
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 * @category פנימי
 * @param {*} result - התוצאה המקורית שיש לצמצם
 * @returns {Object|null} גרסה מקוצרת של התוצאה, או null אם לא קיימת תוצאה
 */
function compactMenuResult_(result) {
  if (!result) {
    return null;
  }

  if (Array.isArray(result)) {
    return {
      type: "array",
      count: result.length
    };
  }

  if (typeof result !== "object") {
    return result;
  }

  return {
    ok: result.ok,
    stopped: result.stopped,
    failedAt: result.failedAt,
    spreadsheetId: result.spreadsheetId,
    spreadsheetUrl: result.spreadsheetUrl,
    total: result.total,
    passed: result.passed,
    failed: result.failed,
    missingSheets: result.missingSheets,
    missingColumns: result.missingColumns,
    stepsCount: result.steps ? result.steps.length : undefined
  };
}

/**
 * מציגה הודעה ארוכה למשתמש בחלון קופץ עם כפתור אישור.
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 * @category פנימי
 * @param {string} title - כותרת החלון הקופץ
 * @param {string} message - תוכן ההודעה שתוצג
 * @returns {void} אינה מחזירה ערך
 */
function showLongMessage_(title, message) {
  SpreadsheetApp.getUi().alert(
    title,
    String(message || ""),
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}
