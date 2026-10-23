#!/usr/bin/env node
/**
 * Fail if any dashboard JSON declares variable names Owlpane import rejects (dots, etc.).
 *   node scripts/lint-library-dashboard-variables.mjs
 */
import fs from "node:fs";
import path from "node:path";

const NAME_RE = /^[A-Za-z_][A-Za-z0-9_]{0,39}$/;
const libraryRoot = path.join(import.meta.dirname, "../library");

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (ent.name.endsWith(".json")) out.push(p);
  }
  return out;
}

const bad = [];
for (const file of walk(libraryRoot)) {
  let doc;
  try {
    doc = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    continue;
  }
  const list = doc?.variables?.list;
  if (!Array.isArray(list)) continue;
  for (const v of list) {
    const name = v?.name;
    if (typeof name !== "string") continue;
    if (!NAME_RE.test(name)) bad.push(`${path.relative(libraryRoot, file)}: variable name "${name}"`);
  }
}

if (bad.length) {
  console.error("Invalid dashboard variable names (use fix-owlpane-library-variables.mjs):\n" + bad.join("\n"));
  process.exit(1);
}
console.log(`OK: variable names in ${walk(libraryRoot).length} library JSON files`);
