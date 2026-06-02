# site-patch — קבצי חיבור GAS API ל-prompt-library-site

תיקייה זו מכילה 6 קבצים שיש להעתיק לתוך `prompt-library-site` על ענף `feat/connect-gas-api`.

## סדר ההחלה

### שלב 1 — העתק את הקבצים

```
site-patch/.env.example                          → .env.example
site-patch/server/index.ts                       → server/index.ts
site-patch/vite.config.ts                        → vite.config.ts
site-patch/client/src/lib/api.ts                 → client/src/lib/api.ts  (קובץ חדש)
site-patch/client/src/contexts/PromptContext.tsx → client/src/contexts/PromptContext.tsx
site-patch/client/src/pages/Dashboard.tsx        → client/src/pages/Dashboard.tsx
```

### שלב 2 — צור קובץ .env

```bash
cp .env.example .env
```

אחר כך ערוך את `.env` והכנס את הערכים האמיתיים:

```
GAS_WEB_APP_URL=https://script.google.com/macros/s/AKfycbzBrF4kapCUMwEq4sguTbkoOg7z5EUaja632W7Ta4E3hptA5AmtCnnHHcFn8TjWbO8b/exec
GAS_AGENT_TOKEN=plt_20260602082457_03291e1e90e045abb94362243e470571_305800869
PORT=3000
```

> **אזהרה**: לעולם אל תעלה `.env` ל-Git! הוא כבר ב-`.gitignore`.

### שלב 3 — הרץ

```bash
pnpm install
pnpm dev
```

פתח http://localhost:3000 — הדשבורד יטען פרומפטים חיים מ-Google Sheets.

---

## מה כל קובץ עושה

| קובץ | שינוי | תיאור |
|---|---|---|
| `server/index.ts` | עדכון מלא | מוסיף proxy routes: `GET /api/health` ו-`POST /api/gas` שמעביר טוקן בצד השרת |
| `vite.config.ts` | עדכון | מוסיף `vitePluginGasProxy()` לאותן routes בסביבת dev |
| `client/src/lib/api.ts` | **חדש** | פונקציות Axios לקריאה ל-Express backend |
| `client/src/contexts/PromptContext.tsx` | עדכון מלא | מחליף mock data בקריאות API אמיתיות עם optimistic updates |
| `client/src/pages/Dashboard.tsx` | עדכון | מוסיף מצבי loading ו-error בראש הקומפוננט |
| `.env.example` | **חדש** | תבנית משתני סביבה |
