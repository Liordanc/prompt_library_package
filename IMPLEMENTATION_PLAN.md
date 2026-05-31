# Implementation Plan — Prompt Library

> **כלל עבודה:** מסמך זה מתעדכן אחרי **כל** פעולה. אסור לסגור משימה ללא עדכון כאן.

---

## סטטוס כולל

| קטגוריה | סטטוס |
|---|---|
| תשתית בסיסית | ✅ הושלם |
| תיעוד ועקרונות עבודה | ✅ הושלם |
| פריסה לסביבה אמיתית | ⏳ ממתין |
| מערכת תבניות עם משתנים | ✅ הושלם |
| גרסאות (Versioning) | ⏳ ממתין |
| UI Sidebar | ⏳ ממתין |
| ייבוא/ייצוא | ⏳ ממתין |

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
- **commit:** (commit הנוכחי)

---

## משימות פתוחות

### 🔴 עדיפות קריטית

#### ⏳ TODO-001 — פריסה בסביבה אמיתית
- **מה צריך לעשות:**
  1. `clasp push` לפרויקט GAS קיים
  2. הרצת `installPromptLibraryInfrastructureStrict()`
  3. הרצת ולידציה מלאה:
     - `runPromptLibrarySetupTest()`
     - `runFirstStableWorkflowTest()`
     - `runFullIntegrityCheck()`
     - `runProductionReadinessCheck()` → חייב להחזיר `ok === true`
  4. בדיקת תפריט "Prompt Library" ב-Spreadsheet
  5. פריסת Web App וקבלת URL
  6. בדיקת `healthCheck` דרך `agent-client.js`
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

#### ⏳ TODO-003 — גרסאות (Versioning)
- **מה צריך לעשות:**
  1. הוסף עמודה `Version` לסכמה (ב-`01_`)
  2. לפני כל עדכון פרומפט — שמור גרסה קודמת בגיליון `PromptVersions`
  3. פונקציה `getPromptHistory(promptId)` — מחזירה רשימת גרסאות
- **קריטריון סיום:** גרסה קודמת נשמרת אוטומטית בכל עדכון

#### ⏳ TODO-004 — UI Sidebar להוספת פרומפטים
- **מה צריך לעשות:**
  1. HTML form ב-Google Apps Script (`HtmlService`)
  2. שדות: Title, Category, Subcategory, Description, Full_Prompt, Tags, Tool_Target, Prompt_Type
  3. תמיכה בתצוגת משתנים לתבניות (TODO-002 תלות)
- **קריטריון סיום:** אפשר להוסיף פרומפט מה-Spreadsheet ללא קוד

---

### 🟢 עדיפות נמוכה

#### ⏳ TODO-005 — ייבוא/ייצוא בצובר
- **מה:** import מ-JSON/CSV, export כל הספרייה

#### ⏳ TODO-006 — דירוג והיסטוריית שימוש
- **מה:** דירוג 1–5, שדה `Last_Used`, מונה `Use_Count`

---

## כללי עדכון מסמך זה

אחרי **כל** פעולה שמבצעים:
1. הזז משימה מ"פתוח" ל"הושלם" עם תאריך וה-commit
2. תעד מה בוצע בדיוק ומה לא בוצע
3. רשום אילו בדיקות רצו ומה היה התוצאה
4. עדכן את "סטטוס כולל" בראש המסמך
