/**
 * Prompt Library Menu Controller
 * File number: 12
 * Requires existing Prompt Library services.
 */

function onOpen() {
  createPromptLibraryMenu();
}

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
    .addItem("➕ Add New Prompt", "menuOpenAddPromptSidebar")
    .addItem("Create Test Prompt", "menuCreateTestPrompt")
    .addItem("Run Full Setup Sequence", "menuRunFullSetupSequence")
    .addToUi();
}

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

function menuRunStrictInstallation() {
  runMenuAction_("Run Strict Installation", () => installPromptLibraryInfrastructureStrict());
}

function menuRunSetupTest() {
  runMenuAction_("Run Setup Test", () => runPromptLibrarySetupTest());
}

function menuRunFirstStableWorkflowTest() {
  runMenuAction_("Run First Stable Workflow Test", () => runFirstStableWorkflowTest());
}

function menuRunProductionReadinessCheck() {
  runMenuAction_("Run Production Readiness Check", () => runProductionReadinessCheck());
}

function menuRunFullIntegrityCheck() {
  runMenuAction_("Run Full Integrity Check", () => runFullIntegrityCheck());
}

function menuValidateRequiredSheets() {
  runMenuAction_("Validate Required Sheets", () => validateRequiredSheets());
}

function menuValidateAllSchemas() {
  runMenuAction_("Validate All Schemas", () => validateAllSheetSchemas());
}

function menuInspectWorkbook() {
  runMenuAction_("Inspect Workbook", () => inspectExistingWorkbook());
}

function menuBuildMigrationReport() {
  runMenuAction_("Build Migration Report", () => buildMigrationReport());
}

function menuRunGatewayHealthCheckLocal() {
  runMenuAction_("Gateway Health Check Local", () => agentHealthCheck_());
}

function menuCreateTestPrompt() {
  runMenuAction_("Create Test Prompt", () => runPromptLibraryCreatePromptTest());
}

function menuRunFullSetupSequence() {
  runMenuAction_("Run Full Setup Sequence", () => runFullSetupSequence_());
}

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

function generateAgentToken_() {
  const uuid = Utilities.getUuid().replace(/-/g, "");
  const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMddHHmmss");
  const random = Math.floor(Math.random() * 1000000000).toString().padStart(9, "0");

  return `plt_${timestamp}_${uuid}_${random}`;
}

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

function assertMenuStepOk_(result) {
  if (result && result.ok === false) {
    throw new Error(JSON.stringify(result));
  }

  return result;
}

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

function showLongMessage_(title, message) {
  SpreadsheetApp.getUi().alert(
    title,
    String(message || ""),
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

// ─── Add Prompt Sidebar ───────────────────────────────────────────────────

function menuOpenAddPromptSidebar() {
  const html = HtmlService
    .createHtmlOutputFromFile("prompt_library_sidebar")
    .setTitle("Add New Prompt")
    .setWidth(320);

  SpreadsheetApp.getUi().showSidebar(html);
}

function sidebarGetCategories() {
  return listCategories().map(function(cat) { return cat.Category_Name; });
}

function sidebarGetSubcategories(categoryName) {
  return getSubcategoriesByCategory(categoryName).map(function(sub) { return sub.Subcategory; });
}

function sidebarAddPrompt(formData) {
  const result = addPrompt(formData);
  logAction("SIDEBAR_ADD_PROMPT", "Prompt", result.Prompt_ID, "Success", "Added via sidebar: " + result.Title);
  return result;
}
