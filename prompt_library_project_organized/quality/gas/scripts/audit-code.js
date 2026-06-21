/**
 * קובץ ביקורת קוד לפרויקט Apps Script.
 * מריצים לפני הדבקה או פריסה.
 */

import fs from "node:fs";
import path from "node:path";

const ROOT_DIR = process.cwd();
const FILE_EXTENSIONS = new Set([".js", ".gs"]);

const forbiddenPatterns = [
  {
    name: "empty-catch-block",
    pattern: /catch\s*\([^)]*\)\s*\{\s*\}/g,
    message: "נמצא catch ריק. חובה לכתוב לוג או לזרוק שגיאה."
  },
  {
    name: "hardcoded-agent-token",
    pattern: /plt_\d{14}_[a-fA-F0-9]{20,}/g,
    message: "נמצא טוקן שנראה אמיתי בתוך הקוד. יש להעביר אותו ל־.env או Script Properties."
  },
  {
    name: "direct-delete-sheet",
    pattern: /\.deleteSheet\s*\(/g,
    message: "נמצאה מחיקת גיליון ישירה. פעולה זו אסורה בלי פונקציה מסומנת Unsafe."
  },
  {
    name: "direct-delete-row",
    pattern: /\.deleteRow\s*\(/g,
    message: "נמצאה מחיקת שורה ישירה. ודא שהפעולה מכוונת ומוגנת."
  },
  {
    name: "delete-file",
    pattern: /\.setTrashed\s*\(\s*true\s*\)/g,
    message: "נמצאה העברת קובץ לאשפה. פעולה זו אסורה בלי אישור מפורש."
  }
];

const requiredFunctionNames = [
  "installPromptLibraryInfrastructureStrict",
  "createPromptLibraryMenu",
  "setAgentGatewayToken",
  "doPost",
  "doGet",
  "createSchemaAndFunctionMapSheets"
];

function main() {
  const files = collectCodeFiles(ROOT_DIR);
  const functionIndex = indexFunctions(files);
  const findings = [];

  findings.push(...findDuplicateFunctions(functionIndex));
  findings.push(...findForbiddenPatterns(files));
  findings.push(...findMissingRequiredFunctions(functionIndex));
  findings.push(...findOversizedFiles(files));

  if (findings.length > 0) {
    console.error("\nCode audit failed:\n");

    for (const finding of findings) {
      console.error(`- [${finding.level}] ${finding.file || "project"}: ${finding.message}`);
    }

    process.exit(1);
  }

  console.log("Code audit passed.");
}

function collectCodeFiles(rootDir) {
  const result = [];

  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.name === "node_modules" || entry.name === ".git") {
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

function indexFunctions(files) {
  const index = new Map();
  const functionPattern = /function\s+([A-Za-z0-9_]+)\s*\(/g;

  for (const file of files) {
    let match;

    while ((match = functionPattern.exec(file.content)) !== null) {
      const functionName = match[1];

      if (!index.has(functionName)) {
        index.set(functionName, []);
      }

      index.get(functionName).push(file.relativePath);
    }
  }

  return index;
}

function findDuplicateFunctions(functionIndex) {
  const findings = [];

  for (const [functionName, files] of functionIndex.entries()) {
    if (files.length > 1) {
      findings.push({
        level: "ERROR",
        file: files.join(", "),
        message: `פונקציה כפולה: ${functionName}`
      });
    }
  }

  return findings;
}

function findForbiddenPatterns(files) {
  const findings = [];

  for (const file of files) {
    for (const rule of forbiddenPatterns) {
      if (rule.pattern.test(file.content)) {
        findings.push({
          level: rule.name === "direct-delete-row" ? "WARNING" : "ERROR",
          file: file.relativePath,
          message: rule.message
        });
      }

      rule.pattern.lastIndex = 0;
    }
  }

  return findings;
}

function findMissingRequiredFunctions(functionIndex) {
  return requiredFunctionNames
    .filter(functionName => !functionIndex.has(functionName))
    .map(functionName => ({
      level: "ERROR",
      file: "project",
      message: `חסרה פונקציית חובה: ${functionName}`
    }));
}

function findOversizedFiles(files) {
  return files
    .filter(file => file.content.split(/\r?\n/).length > 800)
    .map(file => ({
      level: "WARNING",
      file: file.relativePath,
      message: "קובץ גדול מ־800 שורות. מומלץ לשקול פיצול."
    }));
}

main();
