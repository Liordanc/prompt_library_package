/**
 * @file 11_prompt_library_web_app_agent_gateway.gs
 * @category 🌐 שער API לסוכן חיצוני
 *
 * קובץ זה הוא "הדלת הכניסה" לסוכן החיצוני (כמו Antigravity) —
 * מאפשר לסוכן לבצע פעולות בספרייה דרך כתובת Web App,
 * בתנאי שהוא מציג טוקן סודי.
 *
 * פונקציות ציבוריות ראשיות:
 * - doGet            — מקבלת בקשות GET מהסוכן (בעיקר בדיקת חיים)
 * - doPost           — מקבלת בקשות POST ומבצעת פעולות בספרייה
 * - setAgentGatewayToken — שומרת את הטוקן הסודי בהגדרות הסקריפט
 *
 * דרישות: שירותי Prompt Library קיימים.
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
    "validatePrompt"
  ]
});

/**
 * מקבלת בקשות GET שמגיעות מהסוכן החיצוני דרך הדפדפן או כלי API.
 * בדרך כלל משמשת לבדיקת חיים של השירות — לוודא שהוא פועל.
 * @category ציבורי
 * 🌐 נקודת כניסה של Web App — Google מפעיל אותה אוטומטית
 * @param {Object} e - אובייקט האירוע של Google Apps Script עם פרמטרי הבקשה
 * @returns {TextOutput} תשובת JSON עם סטטוס הפעולה
 */
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

/**
 * מקבלת בקשות POST מהסוכן החיצוני ומבצעת את הפעולה המבוקשת בספרייה.
 * זוהי הדרך העיקרית שבה הסוכן מתקשר עם הספרייה.
 * @category ציבורי
 * 🌐 נקודת כניסה של Web App — Google מפעיל אותה אוטומטית
 * @param {Object} e - אובייקט האירוע של Google Apps Script עם גוף הבקשה
 * @returns {TextOutput} תשובת JSON עם תוצאת הפעולה
 */
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

/**
 * מנתבת את בקשת הסוכן לפונקציה המתאימה לפי שם הפעולה המבוקשת.
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 * @category פנימי
 * @param {string} action - שם הפעולה שהסוכן מבקש לבצע
 * @param {Object} payload - גוף הבקשה עם הפרמטרים הנוספים
 * @returns {*} תוצאת הפעולה שהופעלה
 */
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
    validatePrompt: () => validatePromptRecord(requiredValue_(payload.promptId, "promptId"))
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

/**
 * מחזירה אישור שהשירות פעיל ותקין, יחד עם פרטי הגיליון הפעיל.
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 * @category פנימי
 * @returns {Object} אובייקט עם סטטוס "ok", שם השירות, מזהה הגיליון וזמן הבדיקה
 */
function agentHealthCheck_() {
  return {
    status: "ok",
    service: "Prompt Library Agent Gateway",
    spreadsheetId: SpreadsheetApp.getActiveSpreadsheet().getId(),
    spreadsheetUrl: SpreadsheetApp.getActiveSpreadsheet().getUrl(),
    timestamp: new Date().toISOString()
  };
}

/**
 * בודקת שהסוכן מציג טוקן תקין בבקשה, ואחרת זורקת שגיאה שדוחה אותו.
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 * @category פנימי
 * @param {Object} e - אובייקט האירוע של Google Apps Script עם הטוקן
 * @returns {void} אינה מחזירה ערך — זורקת שגיאה אם הטוקן לא תקין
 */
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

/**
 * שולפת את הטוקן הסודי מהבקשה הנכנסת — מגוף הבקשה או מהפרמטרים.
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 * @category פנימי
 * @param {Object} e - אובייקט האירוע של Google Apps Script
 * @returns {string} הטוקן שנשלח בבקשה, או מחרוזת ריקה אם לא נמצא
 */
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

/**
 * שולפת את שם הפעולה המבוקשת מהבקשה הנכנסת — מהפרמטרים או מגוף הבקשה.
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 * @category פנימי
 * @param {Object} e - אובייקט האירוע של Google Apps Script
 * @returns {string} שם הפעולה, או מחרוזת ריקה אם לא נמצאה
 */
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

/**
 * קוראת ומפרסרת את גוף הבקשה הנכנסת מ-JSON לאובייקט JavaScript.
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 * @category פנימי
 * @param {Object} e - אובייקט האירוע של Google Apps Script עם גוף הבקשה
 * @returns {Object} האובייקט שפורסר מה-JSON, או אובייקט ריק אם אין גוף
 */
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

/**
 * בודקת שערך חובה קיים בבקשה, וזורקת שגיאה ברורה אם הוא חסר.
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 * @category פנימי
 * @param {*} value - הערך שיש לבדוק
 * @param {string} fieldName - שם השדה (לשימוש בהודעת השגיאה)
 * @returns {*} הערך המקורי אם הוא תקין
 */
function requiredValue_(value, fieldName) {
  if (value === null || value === undefined || String(value).trim() === "") {
    throw new Error(`Missing required field: ${fieldName}`);
  }

  return value;
}

/**
 * יוצרת תשובת JSON מסודרת לסוכן מהנתונים שהתקבלו.
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 * @category פנימי
 * @param {Object} data - הנתונים שיש להחזיר לסוכן
 * @returns {TextOutput} אובייקט תגובת HTTP עם תוכן JSON
 */
function jsonResponse_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data, null, 2))
    .setMimeType(AGENT_GATEWAY_CONFIG.defaultResponseMimeType);
}

/**
 * יוצרת תשובת שגיאה מסודרת לסוכן ורושמת את הבעיה ביומן הפעולות.
 * 🔒 פונקציה פנימית — לא מיועדת להרצה ישירה
 * @category פנימי
 * @param {string} code - קוד השגיאה לזיהוי סוג הכשל
 * @param {Error} error - אובייקט השגיאה שנזרקה
 * @param {Date} startedAt - הזמן שבו התחילה הבקשה
 * @returns {TextOutput} אובייקט תגובת HTTP עם פרטי השגיאה ב-JSON
 */
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

/**
 * שומרת את הטוקן הסודי בהגדרות הסקריפט — נדרשת פעם אחת בהגדרה הראשונית.
 * הטוקן חייב להכיל לפחות 20 תווים כדי להבטיח אבטחה מספקת.
 * @category ציבורי
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @param {string} token - הטוקן הסודי שיישמר עבור זיהוי הסוכן החיצוני
 * @returns {Object} אובייקט עם ok=true ושם המפתח שנשמר
 */
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
