# Handover — Prompt Library Project

> מסמך זה מיועד לסשן חדש של Claude Code (או לעצמך).  
> כל מה שצריך לדעת כדי להמשיך מאיפה שעצרנו.

---

## תיאור הפרויקט

מערכת ניהול פרומפטים מלאה עם שני ריפואים:

| ריפו | טכנולוגיה | מטרה |
|---|---|---|
| `Liordanc/prompt_library_package` | Google Apps Script | ה-backend — נתונים ב-Google Sheets, כל פרומפט ב-Google Doc |
| `Liordanc/prompt-library-site` | React 19 + Express | ה-frontend — ממשק ויזואלי לניהול הפרומפטים |

---

## מצב נוכחי של כל ריפו

### 1. `prompt_library_package` (GAS)

**ענף פעיל:** `claude/init-3jszQ`  
**מצב:** כל הקוד נדחף ✅

**מה הושלם:**
- 13 קבצי `.gs` — כל שכבות ה-backend (סכמה, CRUD, taxonomy, validation, migration, test runner, Web App gateway, menu)
- `11_prompt_library_web_app_agent_gateway.gs` — חושף 30 פעולות API עם token auth
- `09_prompt_library_main.gs` — כולל `seedMockData()` שזורע נתוני דמו (9 קטגוריות, 8 תגיות, 12 תת-קטגוריות, 12 פרומפטים)
- `seed-mock-data.js` — סקריפט Node.js להפעלת הזריעה דרך ה-API
- `.claude/settings.json` — hook שמריץ `clasp push` אוטומטית אחרי כל עריכת `.gs`

**מה עדיין חסר (חובה לעשות ידנית):**
```bash
# 1. מהמחשב המקומי שלך עם clasp מחובר:
git pull origin claude/init-3jszQ
clasp push

# 2. ב-GAS Editor — פרוס מחדש את ה-Web App:
#    Deploy → Manage deployments → Edit (עיפרון) → New version → Deploy

# 3. הרץ את הזריעה (אם הגיליון ריק):
# ערכי ה-env נמצאים ב-.env המקומי שלך
node seed-mock-data.js
```

---

### 2. `prompt-library-site` (React + Express)

**ענף פעיל:** `feat/connect-gas-api`  
**מצב:** commit מוכן מקומית, טרם נדחף לגיטהאב ❗

**מה הושלם (ב-commit מקומי):**
- `server/index.ts` — Express proxy עם שגיאות מפורטות בעברית; `GET /api/health`, `POST /api/gas`
- `vite.config.ts` — `vitePluginGasProxy()` לסביבת dev
- `client/src/lib/api.ts` — `callGas()` + `toHebrewError()` לפרטי שגיאות בעברית
- `client/src/contexts/PromptContext.tsx` — קריאות API אמיתיות + optimistic updates
- `client/src/pages/PromptIndex.tsx` — מצבי loading/error
- `client/src/pages/PromptDetail.tsx` — spinner לפני בדיקת "לא נמצא"
- `client/src/pages/EditPrompt.tsx` — spinner לפני בדיקת "לא נמצא"
- `client/src/components/ErrorBoundary.tsx` — הודעות שגיאה בעברית

**מה עדיין חסר (חובה לעשות ידנית):**
```bash
# מהמחשב המקומי — בתוך תיקיית prompt-library-site:
git push -u origin feat/connect-gas-api
```

**הרצה מקומית:**
```bash
cd prompt-library-site
cp .env.example .env
# ערוך .env — הכנס GAS_WEB_APP_URL ו-GAS_AGENT_TOKEN
pnpm install
pnpm dev
# פתח http://localhost:3000
```

---

## ערכים קריטיים (שמור בסוד!)

ערכים אלו **לא** נשמרים כאן — הם נמצאים רק ב-`.env` המקומי שלך.

| משתנה | מיקום |
|---|---|
| `GAS_WEB_APP_URL` | ב-`.env` המקומי של `prompt-library-site` |
| `GAS_AGENT_TOKEN` | ב-`.env` המקומי של `prompt-library-site` |
| `PROMPT_LIBRARY_WEB_APP_URL` | ב-`.env` המקומי של `prompt_library_package` |
| `PROMPT_LIBRARY_AGENT_TOKEN` | ב-`.env` המקומי של `prompt_library_package` |

> ⚠️ לעולם אל תכניס ערכים אלו לקוד או ל-Git. רק ב-`.env` מקומי שב-`.gitignore`.

---

## ארכיטקטורת החיבור

```
Browser (React)
    ↓ /api/gas  (POST)
Express Server  ← מוסיף GAS_AGENT_TOKEN
    ↓ POST + token
GAS Web App (11_prompt_library_web_app_agent_gateway.gs)
    ↓ dispatches action
Google Sheets + Google Docs
```

**עיקרון:** הטוקן נשמר רק ב-`.env` של Express. ה-browser לא רואה אותו אף פעם.

---

## מפת הקבצים הקריטיים

### GAS (`prompt_library_package`)
```
01_prompt_library_schema_config.gs       ← סכמה (Single Source of Truth)
04_prompt_library_prompt_service.gs      ← CRUD פרומפטים + addPrompt()
05_prompt_library_taxonomy_service.gs    ← addCategory(), addTag(), addSubcategory()
09_prompt_library_main.gs                ← seedMockData() + תפריט
11_prompt_library_web_app_agent_gateway.gs ← doPost() + 30 actions
seed-mock-data.js                        ← CLI לזריעת נתוני דמו
.claude/settings.json                    ← hook: clasp push אחרי עריכת .gs
```

### React (`prompt-library-site`)
```
client/src/lib/data.ts           ← Single Source of Truth: טיפוסים + mock data
client/src/lib/api.ts            ← callGas() + toHebrewError()
client/src/contexts/PromptContext.tsx ← state management + API calls
server/index.ts                  ← Express proxy (token hidden here)
vite.config.ts                   ← dev proxy
```

---

## פעולות GAS API הזמינות (30 actions)

| Action | תיאור |
|---|---|
| `healthCheck` | בדיקת תקינות (ללא token) |
| `filterPrompts` | סינון + חיפוש `{ criteria: {...} }` |
| `getPrompt` | פרומפט בודד `{ promptId }` |
| `addPrompt` | יצירת פרומפט + Google Doc `{ promptData }` |
| `updatePromptContent` | עדכון תוכן `{ promptId, updates, changeSummary }` |
| `archivePrompt` | העברה לארכיון `{ promptId }` |
| `toggleFavorite` | מועדף/לא מועדף `{ promptId }` |
| `ratePrompt` | דירוג 1–5 `{ promptId, rating }` |
| `fillTemplate` | מילוי משתנים `{ promptId, variables }` |
| `getTemplateVariables` | רשימת משתנים `{ promptId }` |
| `searchPrompts` | חיפוש טקסט `{ query }` |
| `exportPrompts` | ייצוא JSON `{ includeArchived }` |
| `importPrompts` | ייבוא JSON `{ jsonString }` |
| `seedMockData` | זריעת נתוני דמו (idempotent) |
| `getTopRatedPrompts` | מדורגים `{ limit }` |
| `getMostUsedPrompts` | נפוצים `{ limit }` |

---

## משימות פתוחות לסשן הבא

### עדיפות גבוהה
- [ ] `git push` מקומי של ענף `feat/connect-gas-api` ב-prompt-library-site
- [ ] `clasp push` ו-redeploy של ה-Web App
- [ ] `node seed-mock-data.js` לזריעת הנתונים

### עדיפות בינונית
- [ ] טעינת categories/tags/subcategories מה-API (כרגע מגיעים מ-mock data ב-`data.ts`)
- [ ] הוספת עמוד AddPrompt פונקציונלי
- [ ] הוספת עמוד Favorites (`/favorites`)

### עדיפות נמוכה
- [ ] דירוג פרומפטים מה-UI (כפתורי כוכבים)
- [ ] מילוי תבנית (fill template) מה-UI
- [ ] היסטוריית גרסאות

---

## לסשן חדש — הוראות לסוכן

אם פותחים סשן חדש ב-`prompt_library_package`:
1. קרא את `CLAUDE.md` ו-`HANDOVER.md`
2. בדוק `git log --oneline -5` לוודא שאתה על `claude/init-3jszQ`
3. קרא `11_prompt_library_web_app_agent_gateway.gs` למפת ה-API
4. קרא `client/src/lib/data.ts` ב-prompt-library-site למפת הטיפוסים

אם פותחים סשן חדש ב-`prompt-library-site`:
1. ענף פעיל: `feat/connect-gas-api`
2. קרא `client/src/lib/data.ts` — הסכמה הקנונית
3. קרא `client/src/lib/api.ts` — שכבת ה-API
4. קרא `client/src/contexts/PromptContext.tsx` — ה-state management
5. הרץ `pnpm dev` לאחר הגדרת `.env`
