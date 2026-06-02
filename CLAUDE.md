# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## סקירת הפרויקט

מערכת ניהול פרומפטים מבוססת Google Apps Script (GAS). כל פרומפט נשמר כשורה ב-Google Sheets ומקושר ל-Google Doc נפרד. לקוח Node.js חיצוני (`agent-client.js`) מתקשר עם Web App endpoint מוגן בטוקן.

---

## Single Source of Truth — מפת המסמכים הסמכותיים

| נושא | מסמך סמכותי |
|---|---|
| סכמה (גיליונות, עמודות, ערכים מבוקרים) | `01_prompt_library_schema_config.gs` |
| סדר טעינת קבצים ותלויות | `prompt_library_file_manifest_v2.md` |
| רשימת בדיקות חובה לפני ייצור | `CODE_QUALITY_CHECKLIST.md` |
| נקודות עצירה וסיכונים | `KNOWN_RISKS.md` |
| פרוטוקול סוכן חיצוני (Web App API) | `prompt_library_antigravity_agent_instructions.md` |
| תהליך התקנה ידני | `README_INSTALLATION.md` |
| תבנית הוספת פרומפט ראשון | `FIRST_PROMPT_INTAKE_TEMPLATE.md` |

---

## עקרונות כתיבת קוד — חובה לפעול לפיהם תמיד

### 1. תכנן לפני שאתה כותב
- לפני כל שינוי קוד: קרא את הקבצים הרלוונטיים, הבן את התלויות, ותאר בשלב ראשון מה אתה הולך לעשות.
- אל תתחיל לכתוב קוד לפני שיש תכנית ברורה.

### 2. DRY — אל תחזור על עצמך
- לפני כל פונקציה חדשה: חפש אם כבר קיימת מימוש קיים בקבצים 01–13.
- אם לוגיקה כבר קיימת — השתמש בה, אל תשכפל אותה.
- שינוי סכמה → **רק** ב-`01_prompt_library_schema_config.gs`, לעולם לא hard-code שמות גיליונות או אינדקסי עמודות.

### 3. תמיד כתוב בדיקות
- כל פונקציה חדשה או שינוי לוגיקה קיים → בדיקה בקובץ `08_prompt_library_test_runner.gs` או קריאה לפונקציה מאמתת.
- אין "נסה ותראה" — הבדיקה חייבת להיות מוגדרת לפני שהשינוי נחשב מוגמר.

### 4. תעד פעולות שנעשות
- כל שינוי משמעותי שנעשה בקוד → רשום בהודעת ה-commit מה שונה ולמה.
- כל מוטציה בנתונים בזמן ריצה → נרשמת אוטומטית דרך `logAction()` לגיליון Logs.

### 5. אין כפילויות
- `Prompt_ID` חייב להיות ייחודי — תמיד.
- `Full_Doc_Link` חייב להיות ייחודי — תמיד.
- גילוי כפילות = עצירה מידית (ראה `KNOWN_RISKS.md`).

---

## פרוטוקול בדיקה — חובה אחרי כל שינוי

### בדיקה אחרי כל עריכה בקוד

**שלב 1 — בדיקת תחביר:**
```bash
node --check <filename>.gs
```

**שלב 2 — בדיקת שלמות (ב-GAS editor):**
```javascript
runPromptLibrarySetupTest()        // אינפרה תקינה
runFirstStableWorkflowTest()       // זרימה מקצה לקצה
runFullIntegrityCheck()            // שלמות נתונים וסכמה
runProductionReadinessCheck()      // שער מוכנות לייצור → חייב להחזיר ok === true
```

**שלב 3 — בדיקת UI:**
- פתח את ה-Spreadsheet → ודא שתפריט "Prompt Library" קיים ופועל.
- בדוק שאין שגיאות בגיליון Logs.

### קריטריון סיום תיקון או שינוי

שינוי נחשב **מוגמר** רק כאשר:
1. `runProductionReadinessCheck().ok === true`
2. תפריט ה-Spreadsheet נטען ללא שגיאות
3. גיליון Logs לא מכיל שגיאות חדשות
4. אין כפילויות ב-Prompt_ID או Full_Doc_Link

אם אחת מהנקודות לא עומדת — השינוי **אינו** מוגמר.

---

## הפצה (Deployment)

- **העלאה ל-Google Apps Script:** `clasp push` (דורש `.clasp.json` + `@google/clasp`)
- **לקוח Node.js:** העתק `env.example` → `.env`, הגדר `PROMPT_LIBRARY_WEB_APP_URL` ו-`PROMPT_LIBRARY_AGENT_TOKEN`, ואז `node agent-client.js`

---

## ארכיטקטורה — סדר טעינה וקבצים

13 קבצי `.gs` ממוספרים עם סדר טעינה קשיח (01 → 13). כל קובץ תלוי **רק** בקבצים עם מספר נמוך יותר.

```
01_prompt_library_schema_config.gs       — סכמה קנונית (Object.freeze'd)
02_prompt_library_schema_service.gs      — יצירת גיליונות, אתחול, גיבוי
03_prompt_library_document_service.gs    — יצירת/עדכון Google Docs
04_prompt_library_prompt_service.gs      — CRUD פרומפטים, חיפוש, תגיות
05_prompt_library_taxonomy_service.gs    — קטגוריות, תת-קטגוריות, תגיות
06_prompt_library_validation_service.gs  — בדיקות שלמות וסכמה
07_prompt_library_migration_service.gs   — מיגרציה בטוחה מ-workbook קיים
08_prompt_library_test_runner.gs         — חבילות בדיקות (setup, workflow, taxonomy)
09_prompt_library_main.gs                — תפריט, תזמור, פונקציות התקנה
10_prompt_library_strict_installer.gs    — צינור התקנה עם stop-on-error
11_prompt_library_web_app_agent_gateway.gs — endpoints: doGet / doPost
12_prompt_library_menu_controller.gs     — בניית תפריט ה-Spreadsheet
13_schema_and_function_map_builder.gs    — כלי introspection ובנייה
```

**עובדות ארכיטקטוניות מרכזיות:**
- הסכמה היא מקור האמת היחיד — 5 גיליונות נדרשים, 17 עמודות בגיליון Prompts
- כל פרומפט מקושר ל-Google Doc נפרד שה-ID שלו נשמר בעמודת `Full_Doc_Link`
- ה-Web App מאמת דרך טוקן ב-Script Properties; `healthCheck` הוא הפעולה היחידה ללא אימות
- `agent-client.js` הוא wrapper ל-HTTP API — ניתן גם להריץ כ-CLI

---

## מוסכמות קוד

- **פונקציות פנימיות/עזר** — סיומת `_()` (לדוגמה: `normalizePromptData_()`)
- **כל מוטציה** — נרשמת דרך `logAction()` לגיליון Logs
- **שינוי סכמה** — **רק** ב-`01_prompt_library_schema_config.gs`
- **מתקין strict** (`10_`) — עוצר את כל הצינור בכל שגיאה; העדף תמיד `installPromptLibraryInfrastructureStrict()`
- **לוקאל** — עברית (`iw_IL`) ראשונית; כותרות עמודות ותפריטים עלולים להופיע בעברית

---

## מצב הפרוייקט הנוכחי

| שלב | סטטוס |
|---|---|
| קבצי אינפרסטרקטורה בסיסית | ✅ נוצרו |
| מתקין strict | ✅ נוצר |
| Web App agent gateway | ✅ נוצר |
| הוראות Antigravity | ✅ נוצרו |
| התקנה ב-Spreadsheet נקי לבדיקות | ⏳ ממתין |
| פריסת Web App | ⏳ ממתין |
| בדיקת סוכן חיצוני | ⏳ ממתין |
