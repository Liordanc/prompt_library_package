/**
 * Agent Client
 * Node.js client for calling the Prompt Library Web App.
 *
 * Required environment variables:
 * - PROMPT_LIBRARY_WEB_APP_URL
 * - PROMPT_LIBRARY_AGENT_TOKEN
 */

const WEB_APP_URL = process.env.PROMPT_LIBRARY_WEB_APP_URL;
const AGENT_TOKEN = process.env.PROMPT_LIBRARY_AGENT_TOKEN;

if (!WEB_APP_URL) {
  throw new Error("Missing environment variable: PROMPT_LIBRARY_WEB_APP_URL");
}

if (!AGENT_TOKEN) {
  throw new Error("Missing environment variable: PROMPT_LIBRARY_AGENT_TOKEN");
}

async function callPromptLibrary(action, payload = {}) {
  const response = await fetch(WEB_APP_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      token: AGENT_TOKEN,
      action,
      ...payload
    })
  });

  const text = await response.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch (error) {
    throw new Error(`Invalid JSON response: ${text}`);
  }

  if (!data.ok) {
    const message = data.error || data.code || "Prompt Library request failed";
    throw new Error(message);
  }

  return data;
}

async function healthCheck() {
  const response = await fetch(`${WEB_APP_URL}?action=healthCheck`);
  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`Invalid JSON response: ${text}`);
  }
}

async function installStrict() {
  return callPromptLibrary("installStrict");
}

async function setupTest() {
  return callPromptLibrary("setupTest");
}

async function firstStableWorkflowTest() {
  return callPromptLibrary("firstStableWorkflowTest");
}

async function fullIntegrityCheck() {
  return callPromptLibrary("fullIntegrityCheck");
}

async function productionReadinessCheck() {
  return callPromptLibrary("productionReadinessCheck");
}

async function inspectWorkbook() {
  return callPromptLibrary("inspectWorkbook");
}

async function migrationReport() {
  return callPromptLibrary("migrationReport");
}

async function addPrompt(promptData) {
  return callPromptLibrary("addPrompt", { promptData });
}

async function getPrompt(promptId) {
  return callPromptLibrary("getPrompt", { promptId });
}

async function searchPrompts(query) {
  return callPromptLibrary("searchPrompts", { query });
}

async function markFavorite(promptId) {
  return callPromptLibrary("markFavorite", { promptId });
}

async function unmarkFavorite(promptId) {
  return callPromptLibrary("unmarkFavorite", { promptId });
}

async function toggleFavorite(promptId) {
  return callPromptLibrary("toggleFavorite", { promptId });
}

async function archivePrompt(promptId) {
  return callPromptLibrary("archivePrompt", { promptId });
}

async function validatePrompt(promptId) {
  return callPromptLibrary("validatePrompt", { promptId });
}

async function runInstallSequence() {
  const steps = [
    ["healthCheck", healthCheck],
    ["installStrict", installStrict],
    ["setupTest", setupTest],
    ["firstStableWorkflowTest", firstStableWorkflowTest],
    ["fullIntegrityCheck", fullIntegrityCheck],
    ["productionReadinessCheck", productionReadinessCheck]
  ];

  const results = [];

  for (const [name, fn] of steps) {
    console.log(`[AgentClient] Starting: ${name}`);

    try {
      const result = await fn();

      results.push({
        action: name,
        ok: true,
        result
      });

      console.log(`[AgentClient] Completed: ${name}`);
    } catch (error) {
      results.push({
        action: name,
        ok: false,
        error: error.message
      });

      console.error(`[AgentClient] Failed: ${name}`);
      console.error(error.message);

      return {
        ok: false,
        stopped: true,
        failedAt: name,
        results
      };
    }
  }

  return {
    ok: true,
    stopped: false,
    results
  };
}

module.exports = {
  callPromptLibrary,
  healthCheck,
  installStrict,
  setupTest,
  firstStableWorkflowTest,
  fullIntegrityCheck,
  productionReadinessCheck,
  inspectWorkbook,
  migrationReport,
  addPrompt,
  getPrompt,
  searchPrompts,
  markFavorite,
  unmarkFavorite,
  toggleFavorite,
  archivePrompt,
  validatePrompt,
  runInstallSequence
};

if (require.main === module) {
  runInstallSequence()
    .then(result => {
      console.log(JSON.stringify(result, null, 2));
      process.exit(result.ok ? 0 : 1);
    })
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}
