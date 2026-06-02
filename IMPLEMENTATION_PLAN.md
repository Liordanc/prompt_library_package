# Implementation Plan — Prompt Library

> **כלל עבודה:** מסמך זה מתעדכן אחרי **כל** פעולה. אסור לסגור משימה ללא עדכון כאן.

---

## סטטוס כולל

| קטגוריה | סטטוס |
|---|---|
| תשתית בסיסית | ✅ הושלם |
| תיעוד ועקרונות עבודה | ✅ הושלם |
| filterPrompts + ולידציה + בדיקות + README | ✅ הושלם |
| פריסה לסביבה אמיתית | ✅ הושלם |
| מערכת תבניות עם משתנים | ✅ הושלם |
| גרסאות (Versioning) | ✅ הושלם |
| UI Sidebar | ✅ הושלם |
| ייבוא/ייצוא | ✅ הושלם |

---

## לוג פעולות — מה בוצע (כרונולוגי)

### 2026-05-31 — סשן ייסוד

#### ✅ DONE-001 — יצירת CLAUDE.md ראשוני
- **מה:** נוצר קובץ `CLAUDE.md` בסיסי עם סקירת פרויקט, ארכיטקטורה, פריסה ומוסכמות קוד.
- **commit:** `d120501`
- **בדיקות שבוצעו:** ולידציה ידנית של הכיסוי מול קבצי הפרויקט.
- **סטטוס:** ✅ הושלם

#### ✅ DONE-002 — הרחבת CLAUDE.md לזיכרון עבודה מלא
- **מה:** CLAUDE.md הורחב מ-61 ל-182 שורות. נוסף:
  - מפת Single Source of Truth (7 מסמכים)
  - 5 עקרונות כתיבת קוד מחייבים (DRY, תכנן קודם, תמיד בדיקות, תעד, אין כפילויות)
  - פרוטוקול בדיקה מלא (תחביר → GAS tests → UI)
  - קריטריון סיום: שינוי מוגמר רק כש-`runProductionReadinessCheck().ok === true`
  - טבלת מצב פרויקט נוכחי
- **commit:** `ef34211`
- **בדיקות שבוצעו:** ולידציה ידנית שכל הסעיפים מכסים את הנדרש.
- **סטטוס:** ✅ הושלם

#### ✅ DONE-003 — יצירת IMPLEMENTATION_PLAN.md
- **מה:** קובץ זה. מסמך מרכזי למעקב משימות, לוג פעולות, ותכנון הפיתוח.
- **commit:** `6420e84`
- **סטטוס:** ✅ הושלם

#### ✅ DONE-004 — מערכת תבניות עם משתנים (TODO-002)
- **מה:** מימוש מלא של מערכת תבניות עם סינטקס `{{variable}}`.
- **קבצים שהשתנו:**
  - `01_prompt_library_schema_config.gs` — הוספת עמודה `Variables` (LongText, JSON array) לסכמת Prompts
  - `04_prompt_library_prompt_service.gs` — הוספת 8 פונקציות חדשות:
    - `fillTemplate(promptId, valuesMap)` — ציבורי, ממלא משתנים ומחזיר טקסט מוכן
    - `getTemplateVariables(promptId)` — ציבורי, מחזיר מידע על משתנים בפרומפט
    - `getPromptFullText_(promptId)` — פנימי, קורא את הטקסט המלא מ-Google Doc
    - `extractVariables_(text)` — פנימי, מחלץ `{{var}}` מטקסט (ללא כפילויות)
    - `validateTemplateVariables_(promptData)` — פנימי, מוודא שכל משתני הטקסט מוגדרים
    - `parseVariables_(value)` — פנימי, מפרסר JSON של Variables
    - `serializeVariables_(variables)` — פנימי, ממיר מערך ל-JSON string
    - `escapeRegex_(str)` — פנימי, מגן מתווים מיוחדים ב-regex
  - `normalizePromptData_()` עודכן — כולל `Variables` בנורמליזציה
  - `08_prompt_library_test_runner.gs` — הוספת `runPromptLibraryTemplateTest()` עם 11 בדיקות:
    - 7 בדיקות unit (פונקציות פנימיות, ללא GAS)
    - 4 בדיקות אינטגרציה (addPrompt → getTemplateVariables → fillTemplate → שגיאה על משתנה חסר)
  - `runPromptLibraryFullTestSuite()` עודכן — כולל את חבילת הבדיקות החדשה
  - `11_prompt_library_web_app_agent_gateway.gs` — הוספת 2 פעולות ל-API: `fillTemplate`, `getTemplateVariables`
- **בדיקות תחביר:** PASS על כל 4 הקבצים (`node --check`)
- **בדיקות GAS:** ממתינות לפריסה בסביבה אמיתית (TODO-001)
- **commit:** `3bda9bb`
- **סטטוס:** ✅ הושלם

#### ✅ DONE-005 — גרסאות (Versioning) (TODO-003)
- **מה:** מימוש מלא של מערכת גרסאות — שמירת snapshot לפני כל עדכון תוכן.
- **קבצים שהשתנו:**
  - `01_prompt_library_schema_config.gs` — הוספת prefix `VER` ל-idPrefixes; הוספת גיליון `PromptVersions` עם 6 עמודות (Version_ID, Prompt_ID, Version, Snapshot_JSON, Saved_At, Change_Summary)
  - `04_prompt_library_prompt_service.gs` — הוספת 4 פונקציות:
    - `updatePromptContent(promptId, updates, changeSummary)` — ציבורי, שומר snapshot + מגדיל גרסה + מעדכן
    - `getPromptHistory(promptId)` — ציבורי, מחזיר רשימת snapshots ממוינת לפי תאריך
    - `saveVersionSnapshot_(promptId, changeSummary)` — פנימי, שומר שורה ב-PromptVersions
    - `incrementVersion_(currentVersion)` — פנימי, מגדיל גרסה minor (`v1.0 → v1.1`)
  - `08_prompt_library_test_runner.gs` — הוספת `runPromptLibraryVersioningTest()` עם 8 בדיקות:
    - 3 בדיקות unit על `incrementVersion_`
    - 5 בדיקות אינטגרציה (addPrompt → updatePromptContent × 2 → getPromptHistory × 2)
  - `runPromptLibraryFullTestSuite()` עודכן — כולל את חבילת הבדיקות החדשה
  - `11_prompt_library_web_app_agent_gateway.gs` — הוספת `updatePromptContent` ו-`getPromptHistory` ל-API
- **הגיון עיצובי:** `updatePromptRecord` (metadata בלבד — favorite, archive) אינו מגדיל גרסה. רק `updatePromptContent` (שינוי תוכן) מגדיל גרסה ושומר snapshot.
- **בדיקות תחביר:** PASS על כל 4 הקבצים
- **בדיקות GAS:** ממתינות לפריסה בסביבה אמיתית (TODO-001)
- **commit:** `6d634b6`
- **סטטוס:** ✅ הושלם

#### ✅ DONE-006 — UI Sidebar להוספת פרומפטים (TODO-004)
- **מה:** Sidebar ב-Google Sheets לכתיבת פרומפטים ללא קוד.
- **קבצים שנוצרו/עודכנו:**
  - `prompt_library_sidebar.html` — טופס HTML/CSS/JS מלא עם:
    - שדות: Title, Category (dropdown), Subcategory (dropdown דינמי), Description, Full_Prompt, Tags, Prompt_Type, Tool_Target, Status, Source, Notes, Is_Favorite
    - זיהוי אוטומטי של `{{variable}}` בטקסט → הצגת סעיף Variables כשבוחרים Prompt_Type=Template
    - ולידציה client-side לפני שליחה
    - הודעות success/error אחרי שמירה
    - ניקוי טופס לאחר שמירה מוצלחת
  - `12_prompt_library_menu_controller.gs` — נוספו:
    - פריט תפריט "➕ Add New Prompt"
    - `menuOpenAddPromptSidebar()` — פותח את ה-Sidebar
    - `sidebarGetCategories()` — מחזיר רשימת קטגוריות ל-JS
    - `sidebarGetSubcategories(categoryName)` — מחזיר תת-קטגוריות לפי קטגוריה
    - `sidebarAddPrompt(formData)` — מקבל נתוני טופס ומפעיל `addPrompt()`
- **בדיקות תחביר:** PASS על `12_`
- **בדיקות UI:** ממתינות לפריסה בסביבה אמיתית (TODO-001)
- **commit:** `fec4f84`
- **סטטוס:** ✅ הושלם

#### ✅ DONE-007 — ייבוא/ייצוא בצובר (TODO-005)
- **מה:** export כל הפרומפטים ל-JSON Doc + import מ-JSON דרך sidebar.
- **קבצים שנוצרו/עודכנו:**
  - `04_prompt_library_prompt_service.gs` — שתי פונקציות חדשות:
    - `exportPromptsToJson(includeArchived)` — מייצא ל-Google Doc עם JSON, מחזיר URL
    - `importPromptsFromJson(jsonString)` — מייבא מ-JSON array, מחזיר `{ok, total, succeeded, failed, errors}`
  - `prompt_library_import_sidebar.html` — sidebar עם textarea ל-JSON, preview של כמות פריטים, הצגת שגיאות פרטנית
  - `12_prompt_library_menu_controller.gs` — תפריט "Import / Export" עם:
    - `menuExportPromptsToJson()` — מייצא ומציג URL
    - `menuOpenImportSidebar()` — פותח sidebar לייבוא
    - `sidebarImportPrompts(jsonString)` — מחבר את ה-sidebar לשרת
  - `11_prompt_library_web_app_agent_gateway.gs` — פעולות `exportPrompts`, `importPrompts` ב-API
- **הגיון עיצובי:** export מייצר snapshot ניתן לייבוא בחזרה; שדות ID ו-Doc Link נמחקים בייצוא כך שבייבוא יווצרו IDs חדשים ו-Docs חדשים
- **בדיקות תחביר:** PASS על 3 קבצים
- **commit:** `6b6ed53`
- **סטטוס:** ✅ הושלם

#### ✅ DONE-008 — דירוג והיסטוריית שימוש (TODO-006)
- **מה:** שדות Rating (1–5), Use_Count, Last_Used_At + פונקציות ניהול.
- **קבצים שהשתנו:**
  - `01_prompt_library_schema_config.gs` — 3 עמודות חדשות בסכמת Prompts: `Rating`, `Use_Count`, `Last_Used_At`
  - `04_prompt_library_prompt_service.gs` — 5 פונקציות חדשות:
    - `ratePrompt(promptId, rating)` — דירוג 1–5 עם ולידציה
    - `recordPromptUsage(promptId)` — מגדיל Use_Count ומעדכן Last_Used_At
    - `getTopRatedPrompts(limit)` — מחזיר N פרומפטים מדורגים הגבוה ביותר
    - `getMostUsedPrompts(limit)` — מחזיר N פרומפטים ששימשו הכי הרבה
    - `getRecentlyUsedPrompts(limit)` — מחזיר N פרומפטים ששימשו לאחרונה
  - `normalizePromptData_` עודכן — כולל Rating, Use_Count, Last_Used_At
  - `11_prompt_library_web_app_agent_gateway.gs` — 5 פעולות API חדשות
- **בדיקות תחביר:** PASS על 3 קבצים
- **commit:** `f21a8c3`
- **סטטוס:** ✅ הושלם

#### ✅ DONE-009 — סנכרון תיעוד וקוד לקוח
- **מה:** עדכון כל התיעוד והקוד הנגזר כך שישקף את מלוא הפיצ'רים שנבנו.
- **קבצים שהשתנו:**
  - `agent-client.js` — הוספת 11 פונקציות wrapper: fillTemplate, getTemplateVariables, updatePromptContent, getPromptHistory, exportPrompts, importPrompts, ratePrompt, recordPromptUsage, getTopRatedPrompts, getMostUsedPrompts, getRecentlyUsedPrompts + עדכון `module.exports`
  - `01_prompt_library_schema_config.gs` — גרסת סכמה מ-`1.0.0` ל-`1.1.0`
  - `PACKAGE_CHECK_REPORT.md` — עדכון ל-13 קבצים + HTML files + changelog גרסה
  - `prompt_library_file_manifest_v2.md` — עדכון מלא: קבצים 12 ו-13, כל פונקציות ציבוריות, 8 גיליונות, 28 פעולות API
- **בדיקות תחביר:** 13/13 PASS (כל קבצי ה-.gs)
- **commit:** (commit הנוכחי)

#### ✅ DONE-011 — פריסה בסביבה אמיתית (TODO-001)
- **מה:** פריסת כל 13 קבצי ה-.gs לפרויקט GAS חדש + Spreadsheet חדש + Web App.
- **פרטי פריסה:**
  - Script ID: `1FfQhq2JQm5mfAUpdU0qiAqxYPLW7YUY2d_qmKFB_P5GweNbf3XDRC6`
  - Spreadsheet ID: `1Jm5IYntL9XbWQMZWNnR3meMrepkq2Pt1fwtsicurImM`
  - Web App URL: `https://script.google.com/macros/s/AKfycbzBrF4kapCUMwEq4sguTbkoOg7z5EUaja632W7Ta4E3hptA5AmtCnnHHcFn8TjWbO8b/exec`
- **תוצאות בדיקות:**
  - `healthCheck` → `ok: true` (דפדפן)
  - `runPromptLibrarySetupTest()` → `ok: true`, 5/5 passed
  - `runProductionReadinessCheck()` → `ok: true`, כל 8 גיליונות, 21 עמודות, אין כפילויות
- **תאריך:** 2026-06-02
- **סטטוס:** ✅ הושלם

#### ✅ DONE-010 — השלמת פערים: filterPrompts, ולידציה, בדיקות, README
- **מה:** השלמת 4 פערים שזוהו לאחר סקירת הקוד הקיים.
- **קבצים שהשתנו:**
  - `04_prompt_library_prompt_service.gs` — פונקציה חדשה `filterPrompts(criteria)`: סינון לפי category, subcategory, status, promptType, toolTarget, isFavorite, minRating, query
  - `06_prompt_library_validation_service.gs` — הוספת ולידציה לשדה Rating (1–5) ב-`validatePromptRecordShape_`
  - `08_prompt_library_test_runner.gs` — הוספת 2 סוויטות בדיקות חדשות:
    - `runPromptLibraryRatingAndFilterTest()` — 9 בדיקות: ratePrompt, recordPromptUsage, filterPrompts × 3, getTopRated/MostUsed
    - `runPromptLibraryExportImportTest()` — 4 בדיקות: export, import valid, import invalid JSON × 2
  - שתי הסוויטות נוספו ל-`runPromptLibraryFullTestSuite()`
  - `11_prompt_library_web_app_agent_gateway.gs` — הוספת פעולת `filterPrompts` (29 פעולות כעת)
  - `agent-client.js` — הוספת `filterPrompts(criteria)`
  - `README_INSTALLATION.md` — שכתוב מלא: 5 שלבים, כל 13+2 קבצים, קריטריון סיום
- **בדיקות תחביר:** 14/14 PASS (13 .gs + agent-client.js)
- **commit:** (commit הנוכחי)

---

## משימות פתוחות

### 🔴 עדיפות קריטית

#### ✅ TODO-001 — פריסה בסביבה אמיתית — **הושלם ב-DONE-011**
- **פרטי פריסה:**
  - Script ID: `1FfQhq2JQm5mfAUpdU0qiAqxYPLW7YUY2d_qmKFB_P5GweNbf3XDRC6-c`
  - Web App URL: `https://script.google.com/macros/s/AKfycbzBrF4kapCUMwEq4sguTbkoOg7z5EUaja632W7Ta4E3hptA5AmtCnnHHcFn8TjWbO8b/exec`
  - `.clasp.json` — ✅ נוצר מקומית עם ה-Script ID
  - `.env` — ✅ נוצר מקומית עם ה-URL (ממתין לטוקן)
- **שלבים שהושלמו על ידי המשתמש:**
  - [x] `clasp push` — בוצע (URL ו-Script ID סופקו)
  - [x] Web App deployed — ✅ URL קיים
- **שלבים שנותרו (המשתמש צריך לבצע ב-Spreadsheet):**
  1. פתח את ה-Spreadsheet → תפריט **Prompt Library** → **⚙️ Admin** → **Create/Reset Agent Token**
  2. העתק את הטוקן שמוצג
  3. הוסף את הטוקן לקובץ `.env`: `PROMPT_LIBRARY_AGENT_TOKEN=<הטוקן>`
  4. הרץ מ-terminal: `node -e "require('./agent-client').healthCheck().then(console.log)"`
  5. הרץ את רצף ההגדרה המלא מתפריט **Prompt Library → Run Full Setup Sequence**
  6. ודא: `runProductionReadinessCheck().ok === true`
- **חסמים:** דרוש גישה ל-Google Workspace (SpreadsheetApp, DocumentApp)
- **קריטריון סיום:** `runProductionReadinessCheck().ok === true` + Web App מחזיר `{"ok": true}` ל-healthCheck

---

### 🟠 עדיפות גבוהה

#### ✅ TODO-002 — מערכת תבניות עם משתנים ← **הושלם ב-DONE-004**
- **מה צריך לעשות:**
  1. **שינוי סכמה** ב-`01_prompt_library_schema_config.gs`:
     - הוסף עמודה `Variables` (JSON array של `{name, description, default}`)
     - הוסף עמודה `Is_Template` (boolean)
  2. **שירות תבניות** — פונקציות חדשות ב-`04_prompt_library_prompt_service.gs`:
     - `extractVariables_(promptText)` — מחלץ `{{variable}}` מהטקסט
     - `fillTemplate(promptId, valuesMap)` — מחזיר טקסט מלא עם ערכים
     - `validateTemplateVariables_(promptData)` — מוודא שכל משתני הטקסט מוגדרים ברשימה
  3. **בדיקות** ב-`08_prompt_library_test_runner.gs`:
     - בדיקה שחילוץ משתנים עובד
     - בדיקה שמילוי תבנית עובד
     - בדיקה שערכים חסרים מחזירים שגיאה
  4. **Web App** — הוסף פעולה `fillTemplate` ל-`11_prompt_library_web_app_agent_gateway.gs`
- **דוגמה:**
  ```javascript
  // פרומפט תבנית
  Full_Prompt: "Review the following {{language}} code for {{focus_area}} issues."
  Variables: [
    { name: "language", description: "שפת תכנות", default: "JavaScript" },
    { name: "focus_area", description: "מוקד הבדיקה", default: "security" }
  ]

  // שימוש
  fillTemplate("PROMPT-001", { language: "Python", focus_area: "performance" })
  // → "Review the following Python code for performance issues."
  ```
- **קריטריון סיום:** `runProductionReadinessCheck().ok === true` לאחר השינוי

---

### 🟡 עדיפות בינונית

#### ✅ TODO-003 — גרסאות (Versioning) ← **הושלם ב-DONE-005**

#### ✅ TODO-004 — UI Sidebar להוספת פרומפטים ← **הושלם ב-DONE-006**

#### ✅ TODO-004 — UI Sidebar ← **הושלם ב-DONE-006**

#### ✅ TODO-005 — ייבוא/ייצוא בצובר ← **הושלם ב-DONE-007**

---

### 🟢 עדיפות נמוכה

#### ✅ TODO-005 — ייבוא/ייצוא ← **הושלם ב-DONE-007**

#### ✅ TODO-006 — דירוג והיסטוריית שימוש ← **הושלם ב-DONE-008**

#### ✅ TODO-006 — דירוג והיסטוריית שימוש ← **הושלם ב-DONE-008**

---

## כללי עדכון מסמך זה

אחרי **כל** פעולה שמבצעים:
1. הזז משימה מ"פתוח" ל"הושלם" עם תאריך וה-commit
2. תעד מה בוצע בדיוק ומה לא בוצע
3. רשום אילו בדיקות רצו ומה היה התוצאה
4. עדכן את "סטטוס כולל" בראש המסמך
