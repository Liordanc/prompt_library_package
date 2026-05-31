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

function runPromptLibraryVersioningTest() {
  const results = [];

  results.push(runTest_("incrementVersion_basic", () => {
    const next = incrementVersion_("v1.0");
    if (next !== "v1.1") throw new Error(`Expected v1.1, got ${next}`);
    return next;
  }));

  results.push(runTest_("incrementVersion_two_digits", () => {
    const next = incrementVersion_("v1.9");
    if (next !== "v1.10") throw new Error(`Expected v1.10, got ${next}`);
    return next;
  }));

  results.push(runTest_("incrementVersion_unknown_format", () => {
    const next = incrementVersion_("custom-version");
    if (next !== "custom-version") throw new Error(`Expected unchanged, got ${next}`);
    return next;
  }));

  const basePromptData = {
    Title: "Test Versioning Prompt",
    Category: "כללי",
    Subcategory: "לבדיקה",
    Description: "Prompt for versioning test",
    Full_Prompt: "Original content.",
    Tags: ["versioning", "test"],
    Prompt_Type: "General",
    Status: "Draft",
    Source: "Test Runner"
  };

  let createdPromptId = null;

  results.push(runTest_("addPromptForVersioning", () => {
    const record = addPrompt(basePromptData);
    createdPromptId = record.Prompt_ID;
    if (record.Version !== "v1.0") throw new Error(`Expected v1.0, got ${record.Version}`);
    return { promptId: createdPromptId, version: record.Version };
  }));

  if (createdPromptId) {
    results.push(runTest_("updatePromptContent_incrementsVersion", () => {
      const updated = updatePromptContent(createdPromptId, { Description: "Updated description" }, "First update");
      if (updated.Version !== "v1.1") throw new Error(`Expected v1.1, got ${updated.Version}`);
      return { version: updated.Version };
    }));

    results.push(runTest_("getPromptHistory_hasSnapshot", () => {
      const history = getPromptHistory(createdPromptId);
      if (history.length < 1) throw new Error("Expected at least 1 snapshot in history");
      if (history[0].Prompt_ID !== createdPromptId) throw new Error("Snapshot Prompt_ID mismatch");
      return { snapshots: history.length, latestVersion: history[0].Version };
    }));

    results.push(runTest_("updatePromptContent_secondUpdate", () => {
      const updated = updatePromptContent(createdPromptId, { Description: "Second update" }, "Second update");
      if (updated.Version !== "v1.2") throw new Error(`Expected v1.2, got ${updated.Version}`);
      return { version: updated.Version };
    }));

    results.push(runTest_("getPromptHistory_twoSnapshots", () => {
      const history = getPromptHistory(createdPromptId);
      if (history.length < 2) throw new Error(`Expected 2+ snapshots, got ${history.length}`);
      return { snapshots: history.length };
    }));
  }

  return buildTestSummary_("runPromptLibraryVersioningTest", results);
}

function runPromptLibraryTemplateTest() {
  const results = [];

  results.push(runTest_("extractVariables_basic", () => {
    const vars = extractVariables_("Hello {{name}}, you are {{age}} years old.");
    if (vars.length !== 2 || !vars.includes("name") || !vars.includes("age")) {
      throw new Error(`Expected [name, age], got: ${JSON.stringify(vars)}`);
    }
    return vars;
  }));

  results.push(runTest_("extractVariables_empty", () => {
    const vars = extractVariables_("No variables here.");
    if (vars.length !== 0) throw new Error(`Expected [], got: ${JSON.stringify(vars)}`);
    return vars;
  }));

  results.push(runTest_("extractVariables_deduplicate", () => {
    const vars = extractVariables_("{{lang}} and {{lang}} again");
    if (vars.length !== 1) throw new Error(`Expected 1 unique var, got: ${JSON.stringify(vars)}`);
    return vars;
  }));

  results.push(runTest_("parseVariables_array", () => {
    const vars = parseVariables_([{ name: "x", default: "y" }]);
    if (!Array.isArray(vars) || vars[0].name !== "x") throw new Error("parseVariables_ failed for array input");
    return vars;
  }));

  results.push(runTest_("parseVariables_json_string", () => {
    const vars = parseVariables_('[{"name":"x","default":"y"}]');
    if (!Array.isArray(vars) || vars[0].name !== "x") throw new Error("parseVariables_ failed for JSON string");
    return vars;
  }));

  results.push(runTest_("validateTemplateVariables_ok", () => {
    const result = validateTemplateVariables_({
      Full_Prompt: "Review {{language}} code",
      Variables: [{ name: "language", description: "lang", default: "JS" }]
    });
    if (!result.ok) throw new Error(`Validation should pass: ${JSON.stringify(result)}`);
    return result;
  }));

  results.push(runTest_("validateTemplateVariables_undeclared", () => {
    const result = validateTemplateVariables_({
      Full_Prompt: "Review {{language}} code for {{focus}}",
      Variables: [{ name: "language", description: "lang", default: "JS" }]
    });
    if (result.ok) throw new Error("Validation should fail for undeclared variable");
    if (!result.undeclared.includes("focus")) throw new Error("Should report 'focus' as undeclared");
    return result;
  }));

  const templateData = {
    Title: "Test Template - Code Review",
    Category: "כתיבת פרומפטים",
    Subcategory: "פרומפט תבנית",
    Description: "Test template with variable substitution",
    Full_Prompt: "Review the following {{language}} code and check for {{focus_area}} issues.",
    Variables: JSON.stringify([
      { name: "language", description: "שפת תכנות", default: "JavaScript" },
      { name: "focus_area", description: "מוקד הבדיקה", default: "security" }
    ]),
    Tags: ["template", "test"],
    Prompt_Type: "Template",
    Status: "Draft",
    Source: "Test Runner"
  };

  let createdPromptId = null;

  results.push(runTest_("addTemplatePrompt", () => {
    const record = addPrompt(templateData);
    createdPromptId = record.Prompt_ID;
    if (!createdPromptId) throw new Error("No Prompt_ID returned");
    return { promptId: createdPromptId };
  }));

  if (createdPromptId) {
    results.push(runTest_("getTemplateVariables", () => {
      const result = getTemplateVariables(createdPromptId);
      if (!result.isTemplate) throw new Error("Should be detected as template");
      if (result.usedVars.length !== 2) throw new Error(`Expected 2 vars, got: ${result.usedVars.length}`);
      return result;
    }));

    results.push(runTest_("fillTemplate_success", () => {
      const result = fillTemplate(createdPromptId, { language: "Python", focus_area: "performance" });
      if (!result.filledText.includes("Python")) throw new Error("Variable 'language' not substituted");
      if (!result.filledText.includes("performance")) throw new Error("Variable 'focus_area' not substituted");
      if (result.filledText.includes("{{")) throw new Error("Unfilled variables remain in text");
      return result;
    }));

    results.push(runTest_("fillTemplate_missingVariable", () => {
      try {
        fillTemplate(createdPromptId, { language: "Python" });
        throw new Error("Should have thrown for missing variable 'focus_area'");
      } catch (e) {
        if (!e.message.includes("focus_area")) throw new Error(`Wrong error: ${e.message}`);
        return { caught: e.message };
      }
    }));
  }

  return buildTestSummary_("runPromptLibraryTemplateTest", results);
}

function runPromptLibraryFullTestSuite() {
  const suites = [];

  suites.push(runPromptLibrarySetupTest());
  suites.push(runPromptLibraryTaxonomyTest());
  suites.push(runPromptLibraryValidationTest());
  suites.push(runPromptLibraryMigrationInspectionTest());
  suites.push(runPromptLibraryVersioningTest());
  suites.push(runPromptLibraryTemplateTest());

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
