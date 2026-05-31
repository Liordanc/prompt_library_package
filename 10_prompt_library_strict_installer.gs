/**
 * Prompt Library Strict Installer
 * Requires:
 * - PROMPT_LIBRARY_SCHEMA
 * - prompt_library_schema_service
 * - prompt_library_validation_service
 */

function installPromptLibraryInfrastructureStrict() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const startedAt = new Date();

  strictInstallerLog_("START", "STRICT_INSTALLATION_PIPELINE", {
    spreadsheetId: spreadsheet.getId(),
    spreadsheetUrl: spreadsheet.getUrl(),
    startedAt: startedAt.toISOString()
  });

  const steps = [
    {
      name: "backupSpreadsheetStructure",
      fn: () => backupSpreadsheetStructure_(spreadsheet)
    },
    {
      name: "createMissingSheets",
      fn: () => createMissingSheets_(spreadsheet, PROMPT_LIBRARY_SCHEMA)
    },
    {
      name: "applySheetOrder",
      fn: () => applySheetOrder_(spreadsheet, PROMPT_LIBRARY_SCHEMA)
    },
    {
      name: "addMissingColumns",
      fn: () => addMissingColumns_(spreadsheet, PROMPT_LIBRARY_SCHEMA)
    },
    {
      name: "applyFrozenRows",
      fn: () => applyFrozenRows_(spreadsheet, PROMPT_LIBRARY_SCHEMA)
    },
    {
      name: "seedInitialRows",
      fn: () => seedInitialRows_(spreadsheet, PROMPT_LIBRARY_SCHEMA)
    },
    {
      name: "verifyRequiredSheets",
      fn: () => assertStrictStepOk_(verifyRequiredSheets())
    },
    {
      name: "verifyPromptsSchema",
      fn: () => assertStrictStepOk_(verifyPromptsSchema())
    },
    {
      name: "validateRequiredSheets",
      fn: () => assertStrictStepOk_(validateRequiredSheets())
    },
    {
      name: "validateAllSheetSchemas",
      fn: () => assertStrictStepOk_(validateAllSheetSchemas())
    }
  ];

  const executedSteps = [];

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const stepStartedAt = new Date();

    strictInstallerLog_("STEP_START", step.name, {
      order: i + 1,
      totalSteps: steps.length,
      startedAt: stepStartedAt.toISOString()
    });

    try {
      const result = step.fn();
      const finishedAt = new Date();

      executedSteps.push({
        order: i + 1,
        name: step.name,
        ok: true,
        startedAt: stepStartedAt.toISOString(),
        finishedAt: finishedAt.toISOString(),
        durationMs: finishedAt.getTime() - stepStartedAt.getTime(),
        result: result || null
      });

      strictInstallerLog_("STEP_SUCCESS", step.name, {
        order: i + 1,
        durationMs: finishedAt.getTime() - stepStartedAt.getTime(),
        result: compactStrictInstallerResult_(result)
      });

      logAction(
        "STRICT_INSTALL_STEP",
        "InstallStep",
        step.name,
        "Success",
        "Step completed"
      );
    } catch (error) {
      const finishedAt = new Date();

      const failedStep = {
        order: i + 1,
        name: step.name,
        ok: false,
        startedAt: stepStartedAt.toISOString(),
        finishedAt: finishedAt.toISOString(),
        durationMs: finishedAt.getTime() - stepStartedAt.getTime(),
        error: error.message,
        stack: error.stack || ""
      };

      executedSteps.push(failedStep);

      strictInstallerLog_("STEP_FAILED", step.name, {
        order: i + 1,
        durationMs: finishedAt.getTime() - stepStartedAt.getTime(),
        error: error.message,
        stack: error.stack || ""
      });

      logError(
        "STRICT_INSTALL_STEP_FAILED",
        "InstallStep",
        step.name,
        error.message
      );

      const failedResult = {
        ok: false,
        stopped: true,
        failedAt: step.name,
        startedAt: startedAt.toISOString(),
        finishedAt: new Date().toISOString(),
        spreadsheetId: spreadsheet.getId(),
        spreadsheetUrl: spreadsheet.getUrl(),
        steps: executedSteps
      };

      strictInstallerLog_("PIPELINE_STOPPED", "STRICT_INSTALLATION_PIPELINE", {
        ok: false,
        failedAt: step.name,
        executedSteps: executedSteps.length,
        totalSteps: steps.length,
        error: error.message
      });

      logAction(
        "STRICT_INSTALLATION_PIPELINE",
        "Workbook",
        spreadsheet.getId(),
        "Error",
        JSON.stringify({
          ok: false,
          failedAt: step.name,
          error: error.message
        })
      );

      return failedResult;
    }
  }

  const successResult = {
    ok: true,
    stopped: false,
    startedAt: startedAt.toISOString(),
    finishedAt: new Date().toISOString(),
    spreadsheetId: spreadsheet.getId(),
    spreadsheetUrl: spreadsheet.getUrl(),
    steps: executedSteps
  };

  strictInstallerLog_("PIPELINE_SUCCESS", "STRICT_INSTALLATION_PIPELINE", {
    ok: true,
    executedSteps: executedSteps.length,
    totalSteps: steps.length,
    durationMs: new Date().getTime() - startedAt.getTime()
  });

  logAction(
    "STRICT_INSTALLATION_PIPELINE",
    "Workbook",
    spreadsheet.getId(),
    "Success",
    JSON.stringify({
      ok: true,
      steps: executedSteps.length
    })
  );

  return successResult;
}

function assertStrictStepOk_(result) {
  if (result && result.ok === false) {
    throw new Error(JSON.stringify(result));
  }

  return result;
}

function strictInstallerLog_(eventType, name, payload) {
  const message = `[Prompt Library Strict Installer] ${eventType} | ${name} | ${JSON.stringify(payload || {})}`;

  console.log(message);
  Logger.log(message);
}

function compactStrictInstallerResult_(result) {
  if (!result) {
    return null;
  }

  if (typeof result !== "object") {
    return result;
  }

  return {
    ok: result.ok,
    spreadsheetId: result.spreadsheetId,
    spreadsheetUrl: result.spreadsheetUrl,
    sheetName: result.sheetName,
    missingSheets: result.missingSheets,
    missingColumns: result.missingColumns,
    addedColumns: result.addedColumns,
    timestamp: result.timestamp
  };
}
