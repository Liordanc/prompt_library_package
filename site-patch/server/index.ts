import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GAS_URL = process.env.GAS_WEB_APP_URL || "";
const GAS_TOKEN = process.env.GAS_AGENT_TOKEN || "";

async function callGas(action: string, payload: Record<string, unknown> = {}) {
  if (!GAS_URL || !GAS_TOKEN) {
    throw new Error("השרת לא מוגדר — חסרים GAS_WEB_APP_URL או GAS_AGENT_TOKEN בקובץ .env");
  }
  let text: string;
  try {
    const response = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: GAS_TOKEN, action, ...payload }),
    });
    text = await response.text();
  } catch (err) {
    throw new Error(`אין חיבור ל-Google Apps Script — בדוק חיבור לאינטרנט (${String(err)})`);
  }
  let data: Record<string, unknown>;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`תגובה לא תקינה מ-GAS — לא JSON: ${text.slice(0, 120)}`);
  }
  if (!data.ok) {
    const raw = String(data.error || data.code || "");
    if (raw.includes("INVALID_TOKEN") || raw.includes("Unauthorized"))
      throw new Error("אימות נכשל — הטוקן ב-.env שגוי או פג תוקף");
    if (raw.includes("NOT_FOUND"))
      throw new Error("הפריט לא נמצא ב-Sheets");
    if (raw.includes("DUPLICATE"))
      throw new Error("פריט כזה כבר קיים (כפילות)");
    throw new Error(raw || "בקשה ל-GAS נכשלה ללא פרטים");
  }
  return data;
}

async function startServer() {
  const app = express();
  app.use(express.json());
  const server = createServer(app);

  // ─── API Routes ───────────────────────────────────────────────────────────

  // Health check (no token needed on GAS side)
  app.get("/api/health", async (_req, res) => {
    try {
      if (!GAS_URL) {
        res.status(500).json({ ok: false, error: "השרת לא מוגדר — חסר GAS_WEB_APP_URL בקובץ .env" });
        return;
      }
      let data: unknown;
      try {
        const response = await fetch(`${GAS_URL}?action=healthCheck`);
        data = await response.json();
      } catch (err) {
        res.status(500).json({ ok: false, error: `אין חיבור ל-GAS — בדוק חיבור לאינטרנט (${String(err)})` });
        return;
      }
      res.json(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      res.status(500).json({ ok: false, error: message });
    }
  });

  // Generic GAS proxy — action + payload from client (token added server-side)
  app.post("/api/gas", async (req, res) => {
    try {
      const { action, ...payload } = req.body as { action: string; [key: string]: unknown };
      if (!action) {
        res.status(400).json({ ok: false, error: "חסר שם פעולה (action) בבקשה" });
        return;
      }
      const data = await callGas(action, payload);
      res.json(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      res.status(500).json({ ok: false, error: message });
    }
  });

  // ─── Static Files ─────────────────────────────────────────────────────────

  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
