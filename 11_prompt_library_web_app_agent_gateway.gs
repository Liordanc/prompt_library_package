/**
 * Prompt Library Web App Agent Gateway
 * Requires existing Prompt Library services.
 * Public Web App entry points: doPost(e), doGet(e)
 */

const AGENT_GATEWAY_CONFIG = Object.freeze({
  tokenPropertyKey: "PROMPT_LIBRARY_AGENT_TOKEN",
  defaultResponseMimeType: ContentService.MimeType.JSON,
  allowGetExecution: false,
  allowedActions: [
    "healthCheck",
    "installStrict",
    "setupTest",
    "firstStableWorkflowTest",
    "fullIntegrityCheck",
    "productionReadinessCheck",
    "inspectWorkbook",
    "migrationReport",
    "addPrompt",
    "getPrompt",
    "searchPrompts",
    "markFavorite",
    "unmarkFavorite",
    "toggleFavorite",
    "archivePrompt",
    "validatePrompt",
    "fillTemplate",
    "getTemplateVariables",
    "updatePromptContent",
    "getPromptHistory",
    "exportPrompts",
    "importPrompts",
    "ratePrompt",
    "recordPromptUsage",
    "getTopRatedPrompts",
    "getMostUsedPrompts",
    "getRecentlyUsedPrompts",
    "filterPrompts",
    "seedMockData"
  ]
});

function doGet(e) {
  const startedAt = new Date();

  try {
    const action = getRequestAction_(e) || "healthCheck";

    if (action !== "healthCheck" && AGENT_GATEWAY_CONFIG.allowGetExecution !== true) {
      return jsonResponse_({
        ok: false,
        error: "GET execution is disabled. Use POST.",
        action,
        timestamp: startedAt.toISOString()
      });
    }

    if (action !== "healthCheck") {
      assertAgentAuthorized_(e);
    }

    const result = dispatchAgentAction_(action, getRequestPayload_(e));

    return jsonResponse_({
      ok: true,
      action,
      startedAt: startedAt.toISOString(),
      finishedAt: new Date().toISOString(),
      result
    });
  } catch (error) {
    return jsonErrorResponse_("GET_REQUEST_FAILED", error, startedAt);
  }
}

function doPost(e) {
  const startedAt = new Date();

  try {
    assertAgentAuthorized_(e);

    const payload = getRequestPayload_(e);
    const action = payload.action || getRequestAction_(e);

    if (!action) {
      throw new Error("Missing required action");
    }

    const result = dispatchAgentAction_(action, payload);

    return jsonResponse_({
      ok: true,
      action,
      startedAt: startedAt.toISOString(),
      finishedAt: new Date().toISOString(),
      result
    });
  } catch (error) {
    return jsonErrorResponse_("POST_REQUEST_FAILED", error, startedAt);
  }
}

function dispatchAgentAction_(action, payload) {
  if (!AGENT_GATEWAY_CONFIG.allowedActions.includes(action)) {
    throw new Error(`Action is not allowed: ${action}`);
  }

  const actionMap = {
    healthCheck: () => agentHealthCheck_(),
    installStrict: () => installPromptLibraryInfrastructureStrict(),
    setupTest: () => runPromptLibrarySetupTest(),
    firstStableWorkflowTest: () => runFirstStableWorkflowTest(),
    fullIntegrityCheck: () => runFullIntegrityCheck(),
    productionReadinessCheck: () => runProductionReadinessCheck(),
    inspectWorkbook: () => inspectExistingWorkbook(),
    migrationReport: () => buildMigrationReport(),
    addPrompt: () => addPrompt(payload.promptData || payload),
    getPrompt: () => getPromptRecordById(requiredValue_(payload.promptId, "promptId")),
    searchPrompts: () => findPromptRecords(payload.query || ""),
    markFavorite: () => markPromptFavorite(requiredValue_(payload.promptId, "promptId")),
    unmarkFavorite: () => unmarkPromptFavorite(requiredValue_(payload.promptId, "promptId")),
    toggleFavorite: () => togglePromptFavorite(requiredValue_(payload.promptId, "promptId")),
    archivePrompt: () => archivePrompt(requiredValue_(payload.promptId, "promptId")),
    validatePrompt: () => validatePromptRecord(requiredValue_(payload.promptId, "promptId")),
    fillTemplate: () => fillTemplate(
      requiredValue_(payload.promptId, "promptId"),
      requiredValue_(payload.variables, "variables")
    ),
    getTemplateVariables: () => getTemplateVariables(requiredValue_(payload.promptId, "promptId")),
    updatePromptContent: () => updatePromptContent(
      requiredValue_(payload.promptId, "promptId"),
      requiredValue_(payload.updates, "updates"),
      payload.changeSummary || ""
    ),
    getPromptHistory: () => getPromptHistory(requiredValue_(payload.promptId, "promptId")),
    exportPrompts: () => exportPromptsToJson(payload.includeArchived === true),
    importPrompts: () => importPromptsFromJson(requiredValue_(payload.jsonString, "jsonString")),
    ratePrompt: () => ratePrompt(requiredValue_(payload.promptId, "promptId"), requiredValue_(payload.rating, "rating")),
    recordPromptUsage: () => recordPromptUsage(requiredValue_(payload.promptId, "promptId")),
    getTopRatedPrompts: () => getTopRatedPrompts(payload.limit),
    getMostUsedPrompts: () => getMostUsedPrompts(payload.limit),
    getRecentlyUsedPrompts: () => getRecentlyUsedPrompts(payload.limit),
    filterPrompts: () => filterPrompts(payload.criteria || {}),
    seedMockData: () => seedMockData()
  };

  const handler = actionMap[action];

  if (!handler) {
    throw new Error(`No handler found for action: ${action}`);
  }

  console.log(`[AgentGateway] Running action: ${action}`);
  Logger.log(`[AgentGateway] Running action: ${action}`);

  const result = handler();

  console.log(`[AgentGateway] Completed action: ${action}`);
  Logger.log(`[AgentGateway] Completed action: ${action}`);

  return result;
}

function agentHealthCheck_() {
  return {
    status: "ok",
    service: "Prompt Library Agent Gateway",
    spreadsheetId: SpreadsheetApp.getActiveSpreadsheet().getId(),
    spreadsheetUrl: SpreadsheetApp.getActiveSpreadsheet().getUrl(),
    timestamp: new Date().toISOString()
  };
}

function assertAgentAuthorized_(e) {
  const expectedToken = PropertiesService
    .getScriptProperties()
    .getProperty(AGENT_GATEWAY_CONFIG.tokenPropertyKey);

  if (!expectedToken) {
    throw new Error(`Missing script property: ${AGENT_GATEWAY_CONFIG.tokenPropertyKey}`);
  }

  const providedToken = getProvidedToken_(e);

  if (!providedToken || providedToken !== expectedToken) {
    throw new Error("Unauthorized agent request");
  }
}

function getProvidedToken_(e) {
  const payload = getRequestPayload_(e);

  if (payload.token) {
    return String(payload.token).trim();
  }

  if (e && e.parameter && e.parameter.token) {
    return String(e.parameter.token).trim();
  }

  return "";
}

function getRequestAction_(e) {
  if (e && e.parameter && e.parameter.action) {
    return String(e.parameter.action).trim();
  }

  const payload = getRequestPayload_(e);

  if (payload.action) {
    return String(payload.action).trim();
  }

  return "";
}

function getRequestPayload_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    return {};
  }

  const content = String(e.postData.contents || "").trim();

  if (!content) {
    return {};
  }

  try {
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Invalid JSON payload: ${error.message}`);
  }
}

function requiredValue_(value, fieldName) {
  if (value === null || value === undefined || String(value).trim() === "") {
    throw new Error(`Missing required field: ${fieldName}`);
  }

  return value;
}

function jsonResponse_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data, null, 2))
    .setMimeType(AGENT_GATEWAY_CONFIG.defaultResponseMimeType);
}

function jsonErrorResponse_(code, error, startedAt) {
  console.error(`[AgentGateway] ${code}: ${error.message}`);
  Logger.log(`[AgentGateway] ${code}: ${error.message}`);

  try {
    logError(code, "WebApp", "AgentGateway", error.message);
  } catch (logErrorIgnored) {
    Logger.log(`[AgentGateway] Failed to write error log: ${logErrorIgnored.message}`);
  }

  return jsonResponse_({
    ok: false,
    code,
    error: error.message,
    startedAt: startedAt ? startedAt.toISOString() : new Date().toISOString(),
    finishedAt: new Date().toISOString()
  });
}

function setAgentGatewayToken(token) {
  if (!token || String(token).trim().length < 20) {
    throw new Error("Token must contain at least 20 characters");
  }

  PropertiesService
    .getScriptProperties()
    .setProperty(AGENT_GATEWAY_CONFIG.tokenPropertyKey, String(token).trim());

  return {
    ok: true,
    propertyKey: AGENT_GATEWAY_CONFIG.tokenPropertyKey
  };
}
