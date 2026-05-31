/**
 * Prompt Library Test Runner
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

function runPromptLibraryTaxonomyTest() {
  const results = [];

  results.push(runTest_("listCategories", () => listCategories()));
  results.push(runTest_("listTags", () => listTags()));
  results.push(runTest_("getCategoryByName", () => getCategoryByName("כללי")));
  results.push(runTest_("getSubcategoriesByCategory", () => getSubcategoriesByCategory("כללי")));
  results.push(runTest_("validateCategoryPair", () => validateCategoryPair("כללי", "לבדיקה")));

  return buildTestSummary_("runPromptLibraryTaxonomyTest", results);
}

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

function runPromptLibraryMigrationInspectionTest() {
  const results = [];

  results.push(runTest_("inspectExistingWorkbook", () => inspectExistingWorkbook()));
  results.push(runTest_("markDeprecatedSheetsForReview", () => markDeprecatedSheetsForReview()));
  results.push(runTest_("buildMigrationReport", () => buildMigrationReport()));

  return buildTestSummary_("runPromptLibraryMigrationInspectionTest", results);
}

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
