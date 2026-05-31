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
