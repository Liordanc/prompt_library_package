/**
 * Advanced code audit for Google Apps Script project.
 * Runs in Node.js before code is copied or deployed.
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT_DIR = process.cwd();
const FILE_EXTENSIONS = new Set([".js", ".gs"]);

const REQUIRED_FUNCTIONS = [
  "installPromptLibraryInfrastructureStrict",
  "createPromptLibraryMenu",
  "setAgentGatewayToken",
  "doPost",
  "doGet",
  "createSchemaAndFunctionMapSheets"
];

const FORBIDDEN_PATTERNS = [
  {
    level: "ERROR",
    name: "empty-catch-block",
    pattern: /catch\s*\([^)]*\)\s*\{\s*\}/g,
    message: "נמצא catch ריק. חובה לכתוב לוג או לזרוק שגיאה."
  },
  {
    level: "ERROR",
    name: "hardcoded-agent-token",
    pattern: /plt_\d{14}_[a-fA-F0-9]{20,}/g,
    message: "נמצא טוקן שנראה אמיתי בתוך הקוד."
  },
  {
    level: "ERROR",
    name: "script-url-hardcoded",
    pattern: /https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec/g,
    message: "נמצאה כתובת Web App קשיחה בתוך הקוד. יש להעביר ל־.env או הגדרות."
  },
  {
    level: "ERROR",
    name: "direct-delete-sheet",
    pattern: /\.deleteSheet\s*\(/g,
    message: "נמצאה מחיקת גיליון ישירה. פעולה זו אסורה בלי פונקציה מסומנת Unsafe."
  },
  {
    level: "WARNING",
    name: "direct-delete-row",
    pattern: /\.deleteRow\s*\(/g,
    message: "נמצאה מחיקת שורה ישירה. ודא שהפעולה מכוונת ומוגנת."
  },
  {
    level: "ERROR",
    name: "trash-file",
    pattern: /\.setTrashed\s*\(\s*true\s*\)/g,
    message: "נמצאה העברת קובץ לאשפה. פעולה זו אסורה בלי אישור מפורש."
  }
];

function main() {
  const files = collectCodeFiles(ROOT_DIR);
  const findings = [];

  findings.push(...findDuplicateFunctionNames(files));
  findings.push(...findRequiredFunctionGaps(files));
  findings.push(...findForbiddenPatterns(files));
  findings.push(...findDuplicateBlocks(files));
  findings.push(...findLargeFiles(files));
  findings.push(...findMainFunctionsWithoutLogs(files));

  if (findings.length > 0) {
    console.error("\nAdvanced code audit failed:\n");

    for (const finding of findings) {
      console.error(`- [${finding.level}] ${finding.file || "project"}: ${finding.message}`);
    }

    const hasError = findings.some(finding => finding.level === "ERROR");

    process.exit(hasError ? 1 : 0);
  }

  console.log("Advanced code audit passed.");
}

function collectCodeFiles(rootDir) {
  const result = [];

  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      if (["node_modules", ".git", "dist", "build"].includes(entry.name)) {
        continue;
      }

      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }

      if (FILE_EXTENSIONS.has(path.extname(entry.name))) {
        result.push({
          path: fullPath,
          relativePath: path.relative(rootDir, fullPath),
          content: fs.readFileSync(fullPath, "utf8")
        });
      }
    }
  }

  walk(rootDir);
  return result;
}

function findDuplicateFunctionNames(files) {
  const index = new Map();
  const pattern = /function\s+([A-Za-z0-9_]+)\s*\(/g;

  for (const file of files) {
    let match;

    while ((match = pattern.exec(file.content)) !== null) {
      const name = match[1];

      if (!index.has(name)) {
        index.set(name, []);
      }

      index.get(name).push(file.relativePath);
    }
  }

  return [...index.entries()]
    .filter(([, locations]) => locations.length > 1)
    .map(([name, locations]) => ({
      level: "ERROR",
      file: locations.join(", "),
      message: `שם פונקציה כפול: ${name}`
    }));
}

function findRequiredFunctionGaps(files) {
  const allContent = files.map(file => file.content).join("\n");

  return REQUIRED_FUNCTIONS
    .filter(name => !new RegExp(`function\\s+${name}\\s*\\(`).test(allContent))
    .map(name => ({
      level: "ERROR",
      file: "project",
      message: `חסרה פונקציית חובה: ${name}`
    }));
}

function findForbiddenPatterns(files) {
  const findings = [];

  for (const file of files) {
    for (const rule of FORBIDDEN_PATTERNS) {
      if (rule.pattern.test(file.content)) {
        findings.push({
          level: rule.level,
          file: file.relativePath,
          message: rule.message
        });
      }

      rule.pattern.lastIndex = 0;
    }
  }

  return findings;
}

function findDuplicateBlocks(files) {
  const blockMap = new Map();
  const findings = [];
  const minLines = 8;

  for (const file of files) {
    const lines = file.content
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line && !line.startsWith("//") && !line.startsWith("*"));

    for (let i = 0; i <= lines.length - minLines; i++) {
      const block = lines.slice(i, i + minLines).join("\n");
      const hash = crypto.createHash("sha256").update(block).digest("hex");

      if (!blockMap.has(hash)) {
        blockMap.set(hash, []);
      }

      blockMap.get(hash).push({
        file: file.relativePath,
        line: i + 1
      });
    }
  }

  for (const [, locations] of blockMap.entries()) {
    const uniqueLocations = dedupeLocations(locations);

    if (uniqueLocations.length > 1) {
      findings.push({
        level: "WARNING",
        file: uniqueLocations.map(location => `${location.file}:${location.line}`).join(", "),
        message: "נמצא בלוק קוד כפול או כמעט כפול. בדוק אם צריך להעביר לפונקציה משותפת."
      });
    }
  }

  return findings.slice(0, 30);
}

function dedupeLocations(locations) {
  const seen = new Set();
  const result = [];

  for (const location of locations) {
    const key = `${location.file}:${location.line}`;

    if (!seen.has(key)) {
      seen.add(key);
      result.push(location);
    }
  }

  return result;
}

function findLargeFiles(files) {
  return files
    .filter(file => file.content.split(/\r?\n/).length > 800)
    .map(file => ({
      level: "WARNING",
      file: file.relativePath,
      message: "קובץ גדול מ־800 שורות. מומלץ לפצל."
    }));
}

function findMainFunctionsWithoutLogs(files) {
  const findings = [];
  const mainFunctionPattern = /function\s+(menu[A-Za-z0-9_]+|run[A-Za-z0-9_]+|install[A-Za-z0-9_]+|doPost|doGet)\s*\([^)]*\)\s*\{/g;

  for (const file of files) {
    let match;

    while ((match = mainFunctionPattern.exec(file.content)) !== null) {
      const name = match[1];
      const functionStart = match.index;
      const nextFunctionIndex = file.content.indexOf("\nfunction ", functionStart + 1);
      const functionBody = file.content.slice(functionStart, nextFunctionIndex === -1 ? undefined : nextFunctionIndex);

      const hasLog = functionBody.includes("Logger.log") || functionBody.includes("console.log") || functionBody.includes("logAction");

      if (!hasLog) {
        findings.push({
          level: "WARNING",
          file: file.relativePath,
          message: `פונקציה מרכזית ללא לוג ברור: ${name}`
        });
      }
    }
  }

  return findings;
}

main();
