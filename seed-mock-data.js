/**
 * Seed Mock Data
 * Seeds all mock data (categories, tags, subcategories, prompts) into Google Sheets
 * via the Prompt Library Web App API.
 *
 * Required environment variables:
 * - PROMPT_LIBRARY_WEB_APP_URL
 * - PROMPT_LIBRARY_AGENT_TOKEN
 *
 * Usage:
 *   node seed-mock-data.js
 */

const WEB_APP_URL = process.env.PROMPT_LIBRARY_WEB_APP_URL;
const AGENT_TOKEN = process.env.PROMPT_LIBRARY_AGENT_TOKEN;

if (!WEB_APP_URL) {
  console.error("❌ Missing environment variable: PROMPT_LIBRARY_WEB_APP_URL");
  process.exit(1);
}

if (!AGENT_TOKEN) {
  console.error("❌ Missing environment variable: PROMPT_LIBRARY_AGENT_TOKEN");
  process.exit(1);
}

async function callGas(action, payload = {}) {
  const response = await fetch(WEB_APP_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: AGENT_TOKEN, action, ...payload }),
    redirect: "follow"
  });

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Invalid JSON response: ${text.slice(0, 200)}`);
  }

  if (!data.ok) {
    throw new Error(data.error || data.code || "Request failed");
  }

  return data.result;
}

async function main() {
  console.log("🌱 Starting mock data seed...\n");

  let result;
  try {
    result = await callGas("seedMockData");
  } catch (err) {
    console.error("❌ seedMockData failed:", err.message);
    process.exit(1);
  }

  // Categories
  console.log("📂 Categories:");
  (result.categories || []).forEach(c => {
    const icon = c.status === "added" ? "  ✅" : "  ⏭️ ";
    console.log(`${icon} ${c.name || c.id} — ${c.status}${c.reason ? ` (${c.reason})` : ""}`);
  });

  // Tags
  console.log("\n🏷️  Tags:");
  (result.tags || []).forEach(t => {
    const icon = t.status === "added" ? "  ✅" : "  ⏭️ ";
    console.log(`${icon} ${t.name || t.id} — ${t.status}${t.reason ? ` (${t.reason})` : ""}`);
  });

  // Subcategories
  console.log("\n📁 Subcategories:");
  (result.subcategories || []).forEach(s => {
    const icon = s.status === "added" ? "  ✅" : "  ⏭️ ";
    console.log(`${icon} ${s.name || s.id} — ${s.status}${s.reason ? ` (${s.reason})` : ""}`);
  });

  // Prompts
  console.log("\n📝 Prompts:");
  console.log(`  ✅ Succeeded: ${result.prompts?.succeeded ?? 0}`);
  console.log(`  ❌ Failed:    ${result.prompts?.failed ?? 0}`);
  if (result.prompts?.errors?.length > 0) {
    result.prompts.errors.forEach(e => console.log(`     - ${e}`));
  }

  console.log("\n" + (result.ok ? "✅ Seed complete!" : "⚠️  Seed finished with errors."));
  if (!result.ok) process.exit(1);
}

main().catch(err => {
  console.error("❌ Unexpected error:", err);
  process.exit(1);
});
