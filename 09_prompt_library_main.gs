/**
 * Prompt Library Main
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

function menuInitializePromptLibrary() {
  runWithUiAlert_("Initialize Library", () => initializePromptLibrary());
}

function menuRunSetupTest() {
  runWithUiAlert_("Run Setup Test", () => runPromptLibrarySetupTest());
}

function menuRunValidation() {
  runWithUiAlert_("Run Validation", () => runFullIntegrityCheck());
}

function menuInspectWorkbook() {
  runWithUiAlert_("Inspect Workbook", () => inspectExistingWorkbook());
}

function menuRunMigrationReport() {
  runWithUiAlert_("Run Migration Report", () => buildMigrationReport());
}

function menuCreateTestPrompt() {
  runWithUiAlert_("Create Test Prompt", () => runPromptLibraryCreatePromptTest());
}

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

// ─────────────────────────────────────────────────────────────────────────────
// Seed Mock Data — מוסיף קטגוריות, תגיות, תת-קטגוריות ופרומפטים לדוגמה
// ─────────────────────────────────────────────────────────────────────────────

function seedMockData() {
  var results = { categories: [], tags: [], subcategories: [], prompts: { succeeded: 0, failed: 0, errors: [] } };

  // ── קטגוריות ──
  var categories = [
    { Category_ID: "cat-01", Category_Name: "קוד ופיתוח",         Description: "פרומפטים לפיתוח תוכנה וקוד" },
    { Category_ID: "cat-02", Category_Name: "עיצוב וממשק",         Description: "פרומפטים לעיצוב UI/UX" },
    { Category_ID: "cat-03", Category_Name: "מסמכים וסיכומים",     Description: "פרומפטים ליצירת מסמכים וסיכומים" },
    { Category_ID: "cat-04", Category_Name: "הוראה ולמידה",        Description: "פרומפטים להוראה ולמידה" },
    { Category_ID: "cat-05", Category_Name: "מחקר ואימות",         Description: "פרומפטים למחקר ואימות מידע" },
    { Category_ID: "cat-06", Category_Name: "ניהול עבודה",         Description: "פרומפטים לניהול משימות ופרויקטים" },
    { Category_ID: "cat-07", Category_Name: "כתיבת פרומפטים",      Description: "פרומפטים לכתיבה ושיפור פרומפטים" },
    { Category_ID: "cat-08", Category_Name: "כללי",                Description: "פרומפטים כלליים" },
    { Category_ID: "cat-99", Category_Name: "ארכיון",              Description: "פרומפטים שהועברו לארכיון" }
  ];

  categories.forEach(function(cat) {
    try {
      addCategory(cat);
      results.categories.push({ id: cat.Category_ID, name: cat.Category_Name, status: "added" });
    } catch (e) {
      results.categories.push({ id: cat.Category_ID, name: cat.Category_Name, status: "skipped", reason: e.message });
    }
  });

  // ── תגיות ──
  var tags = [
    { Tag_Name: "SEO",          Tag_Color: "#d97706", Description: "קידום אתרים" },
    { Tag_Name: "רעיונות",       Tag_Color: "#65a30d", Description: "סיעור מוחות ורעיונות" },
    { Tag_Name: "דחוף",          Tag_Color: "#dc2626", Description: "פרומפטים בעדיפות גבוהה" },
    { Tag_Name: "JavaScript",   Tag_Color: "#eab308", Description: "פרומפטים ל-JavaScript" },
    { Tag_Name: "Python",       Tag_Color: "#3b82f6", Description: "פרומפטים ל-Python" },
    { Tag_Name: "תיעוד",         Tag_Color: "#8b5cf6", Description: "פרומפטים לתיעוד טכני" },
    { Tag_Name: "ביקורת קוד",    Tag_Color: "#06b6d4", Description: "פרומפטים לביקורת קוד" },
    { Tag_Name: "UX",           Tag_Color: "#ec4899", Description: "פרומפטים לחוויית משתמש" }
  ];

  tags.forEach(function(tag) {
    try {
      addTag(tag);
      results.tags.push({ name: tag.Tag_Name, status: "added" });
    } catch (e) {
      results.tags.push({ name: tag.Tag_Name, status: "skipped", reason: e.message });
    }
  });

  // ── תת-קטגוריות ──
  var subcategories = [
    { Category: "קוד ופיתוח",        Subcategory: "ביקורת קוד",      Description: "בדיקת איכות קוד" },
    { Category: "קוד ופיתוח",        Subcategory: "יצירת קוד",       Description: "יצירת קוד חדש" },
    { Category: "קוד ופיתוח",        Subcategory: "ארכיטקטורה",      Description: "תכנון ארכיטקטורת מערכת" },
    { Category: "קוד ופיתוח",        Subcategory: "מיגרציה",         Description: "מיגרציה ושדרוג" },
    { Category: "עיצוב וממשק",        Subcategory: "מחקר UX",         Description: "מחקר חוויית משתמש" },
    { Category: "עיצוב וממשק",        Subcategory: "עיצוב ויזואלי",   Description: "עיצוב גרפי וויזואלי" },
    { Category: "מסמכים וסיכומים",    Subcategory: "תיעוד טכני",      Description: "כתיבת תיעוד טכני" },
    { Category: "מסמכים וסיכומים",    Subcategory: "סיכומים",         Description: "סיכומי פגישות ותוכן" },
    { Category: "מחקר ואימות",        Subcategory: "ניתוח מאמרים",    Description: "ניתוח מאמרים אקדמיים" },
    { Category: "כתיבת פרומפטים",     Subcategory: "אופטימיזציה",     Description: "שיפור פרומפטים קיימים" },
    { Category: "כתיבת פרומפטים",     Subcategory: "מטא-פרומפטים",   Description: "פרומפטים על פרומפטים" },
    { Category: "ניהול עבודה",        Subcategory: "תעדוף",           Description: "תעדוף משימות ופרויקטים" }
  ];

  subcategories.forEach(function(sub) {
    try {
      addSubcategory(sub);
      results.subcategories.push({ name: sub.Category + " / " + sub.Subcategory, status: "added" });
    } catch (e) {
      results.subcategories.push({ name: sub.Category + " / " + sub.Subcategory, status: "skipped", reason: e.message });
    }
  });

  // ── פרומפטים ──
  var prompts = [
    { Title: "Deep Code Quality Audit",       Category: "קוד ופיתוח",        Subcategory: "ביקורת קוד",    Description: "פרומפט מקיף לביקורת איכות קוד מעמיקה", Preview_Text: "You are a senior code reviewer. Analyze the following code for: 1) Performance issues 2) Security vulnerabilities 3) Maintainability concerns 4) Style consistency", Tags: ["ביקורת קוד","JavaScript"], Is_Favorite: true,  Tool_Target: "ChatGPT", Prompt_Type: "Audit",    Status: "Active",   Notes: "עובד מצוין עם GPT-4." },
    { Title: "React Component Generator",     Category: "קוד ופיתוח",        Subcategory: "יצירת קוד",    Description: "יצירת קומפוננטות React מודולריות עם TypeScript",             Preview_Text: "Generate a React component with the following specifications: - TypeScript with proper type definitions - Custom hooks for logic separation - Tailwind CSS for styling",         Tags: ["JavaScript","רעיונות"],  Is_Favorite: true,  Tool_Target: "ChatGPT", Prompt_Type: "Template", Status: "Active"   },
    { Title: "Technical Documentation Writer",Category: "מסמכים וסיכומים",   Subcategory: "תיעוד טכני",  Description: "כתיבת תיעוד טכני מקצועי לפרויקטים ו-APIs",                 Preview_Text: "You are a technical documentation specialist. Create comprehensive documentation for the following project/API that includes: Overview, Getting Started, API Reference",       Tags: ["תיעוד"],                  Is_Favorite: false, Tool_Target: "Claude",   Prompt_Type: "Template", Status: "Active",  Notes: "Claude מייצר תיעוד מפורט יותר." },
    { Title: "UX Research Interview Guide",   Category: "עיצוב וממשק",        Subcategory: "מחקר UX",     Description: "יצירת מדריך ראיונות למחקר חוויית משתמש",                   Preview_Text: "Create a UX research interview guide for [product/feature]. Include: warm-up questions, core exploration questions, task-based scenarios, and wrap-up",                    Tags: ["UX","רעיונות"],           Is_Favorite: false, Tool_Target: "General",  Prompt_Type: "Research",  Status: "Active"   },
    { Title: "SEO Content Optimizer",         Category: "כתיבת פרומפטים",    Subcategory: "אופטימיזציה", Description: "אופטימיזציה של תוכן לקידום אורגני",                         Preview_Text: "Analyze and optimize the following content for SEO. Focus on: keyword density, meta description, header structure, internal linking opportunities",                         Tags: ["SEO"],                    Is_Favorite: true,  Tool_Target: "ChatGPT", Prompt_Type: "Template", Status: "Active",  Notes: "לעדכן עם הנחיות Google 2024." },
    { Title: "Python Data Pipeline Builder",  Category: "קוד ופיתוח",        Subcategory: "ארכיטקטורה",  Description: "בניית צינורות נתונים ב-Python עם טיפול בשגיאות",            Preview_Text: "Design a Python data pipeline that: 1) Reads from [source] 2) Transforms data using [logic] 3) Validates output schema 4) Writes to [destination]",                       Tags: ["Python"],                 Is_Favorite: false, Tool_Target: "ChatGPT", Prompt_Type: "Code",     Status: "Active"   },
    { Title: "Meeting Summary Generator",     Category: "מסמכים וסיכומים",   Subcategory: "סיכומים",     Description: "יצירת סיכומי פגישות מובנים עם פעולות נדרשות",               Preview_Text: "Summarize the following meeting transcript into a structured format: Key Decisions, Action Items (with owners and deadlines), Discussion Points, Next Steps",              Tags: ["תיעוד"],                  Is_Favorite: false, Tool_Target: "Gemini",   Prompt_Type: "Template", Status: "Active",  Notes: "Gemini טוב בסיכום שיחות ארוכות." },
    { Title: "Prompt Engineering Meta-Prompt",Category: "כתיבת פרומפטים",    Subcategory: "מטא-פרומפטים",Description: "פרומפט לשיפור ואופטימיזציה של פרומפטים קיימים",              Preview_Text: "You are a prompt engineering expert. Analyze the following prompt and improve it by: 1) Adding clear role definition 2) Structuring output format 3) Adding constraints",   Tags: ["רעיונות"],                Is_Favorite: true,  Tool_Target: "Claude",   Prompt_Type: "System",   Status: "Active",  Notes: "הפרומפט הכי שימושי בספרייה." },
    { Title: "Task Prioritization Framework", Category: "ניהול עבודה",        Subcategory: "תעדוף",       Description: "מסגרת לתעדוף משימות לפי דחיפות, חשיבות והשפעה",            Preview_Text: "Help me prioritize the following tasks using the Eisenhower Matrix combined with impact scoring. For each task, determine: Urgency (1-5), Importance (1-5)",               Tags: ["דחוף"],                   Is_Favorite: false, Tool_Target: "General",  Prompt_Type: "Workflow",  Status: "Active"   },
    { Title: "Legacy API Migration Guide",    Category: "קוד ופיתוח",        Subcategory: "מיגרציה",     Description: "מדריך למיגרציה של API ישן לגרסה חדשה",                     Preview_Text: "Create a migration guide from [old API] to [new API]. Include: breaking changes analysis, endpoint mapping, data transformation steps",                                  Tags: ["JavaScript","תיעוד"],    Is_Favorite: false, Tool_Target: "ChatGPT", Prompt_Type: "Code",     Status: "Draft"    },
    { Title: "Old Marketing Prompt",          Category: "ארכיון",             Subcategory: "",            Description: "פרומפט שיווקי ישן שהוחלף",                                 Preview_Text: "Write a marketing copy for...",                                                                                                                                              Tags: ["SEO"],                    Is_Favorite: false, Tool_Target: "ChatGPT", Prompt_Type: "General",  Status: "Archived", Notes: "הוחלף ב-SEO Content Optimizer." },
    { Title: "Research Paper Analyzer",       Category: "מחקר ואימות",        Subcategory: "ניתוח מאמרים",Description: "ניתוח מאמרים אקדמיים וחילוץ תובנות מרכזיות",               Preview_Text: "Analyze the following research paper and extract: Main thesis, Methodology, Key findings, Limitations, Practical implications, Citation-worthy quotes",                    Tags: ["רעיונות","תיעוד"],        Is_Favorite: false, Tool_Target: "Claude",   Prompt_Type: "Research",  Status: "Active"   }
  ];

  prompts.forEach(function(p) {
    try {
      addPrompt(p);
      results.prompts.succeeded++;
    } catch (e) {
      results.prompts.failed++;
      results.prompts.errors.push({ title: p.Title, error: e.message });
    }
  });

  results.ok = results.prompts.failed === 0;
  results.summary = {
    categories: results.categories.filter(function(c) { return c.status === "added"; }).length + " נוספו, " + results.categories.filter(function(c) { return c.status === "skipped"; }).length + " קיימות",
    tags:        results.tags.filter(function(t) { return t.status === "added"; }).length + " נוספו, " + results.tags.filter(function(t) { return t.status === "skipped"; }).length + " קיימות",
    subcategories: results.subcategories.filter(function(s) { return s.status === "added"; }).length + " נוספו, " + results.subcategories.filter(function(s) { return s.status === "skipped"; }).length + " קיימות",
    prompts: results.prompts.succeeded + " נוספו, " + results.prompts.failed + " נכשלו"
  };

  logAction("SEED_MOCK_DATA", "Workbook", SpreadsheetApp.getActiveSpreadsheet().getId(), results.ok ? "Success" : "Warning", JSON.stringify(results.summary));

  return results;
}

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
