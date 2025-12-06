import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const apiPath = path.join(__dirname, "api.ts");
const srcDir = path.join(__dirname, "..");

console.log("\n🔎 Scanning API exports...\n");

// Read api.ts
const apiContent = fs.readFileSync(apiPath, "utf-8");

// Extract exported function names
const exportRegex = /export\s+(?:async\s+)?function\s+(\w+)/g;
const exportRegexConst = /export\s+const\s+(\w+)\s*=/g;

let match;
const exported = new Set();

while ((match = exportRegex.exec(apiContent))) {
  exported.add(match[1]);
}

while ((match = exportRegexConst.exec(apiContent))) {
  exported.add(match[1]);
}

console.log("📤 Exported API functions:");
console.log([...exported].map((e) => " - " + e).join("\n"));

console.log("\n🔍 Scanning frontend for imported API functions...\n");

function scanDir(dir) {
  let imported = new Set();

  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);

    if (fs.statSync(fullPath).isDirectory()) {
      imported = new Set([...imported, ...scanDir(fullPath)]);
    } else if (file.endsWith(".ts") || file.endsWith(".tsx")) {
      const content = fs.readFileSync(fullPath, "utf-8");

      const importRegex =
        /import\s*{([^}]+)}\s*from\s*["']@\/lib\/api["']/g;

      let m;
      while ((m = importRegex.exec(content))) {
        const names = m[1].split(",").map((x) => x.trim());
        names.forEach((n) => imported.add(n));
      }
    }
  }
  return imported;
}

const importedFunctions = scanDir(srcDir);

console.log("📥 Imported API functions:");
console.log([...importedFunctions].map((e) => " - " + e).join("\n"));

console.log("\n❌ Missing exports (imported but NOT exported):\n");

const missing = [...importedFunctions].filter((i) => !exported.has(i));

if (missing.length === 0) {
  console.log("🎉 All good! No missing exports.");
} else {
  missing.forEach((fn) => console.log(" - " + fn));
}

console.log("\n✔ Done.\n");
