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
    throw new Error("GAS_WEB_APP_URL or GAS_AGENT_TOKEN not configured in .env");
  }
  const response = await fetch(GAS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: GAS_TOKEN, action, ...payload }),
  });
  const text = await response.text();
  const data = JSON.parse(text);
  if (!data.ok) throw new Error(data.error || data.code || "GAS request failed");
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
        res.status(500).json({ ok: false, error: "GAS_WEB_APP_URL not configured" });
        return;
      }
      const response = await fetch(`${GAS_URL}?action=healthCheck`);
      const data = await response.json();
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
        res.status(400).json({ ok: false, error: "Missing action" });
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
