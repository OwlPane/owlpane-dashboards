#!/usr/bin/env node
/**
 * Fail if library/ still contains upstream product residue that ships to customers.
 * Attribution stays in ATTRIBUTION.md and the sync scripts, outside this tree.
 *   node scripts/lint-upstream-residue.mjs
 */
import fs from "node:fs";
import path from "node:path";

const libraryRoot = path.join(import.meta.dirname, "../library");
const TEXT_EXT = new Set([".json", ".md", ".txt", ".yml", ".yaml"]);
const CONTENT_RE = /zinclabs|_o2_|openobserve|zincobserve/i;
const FILENAME_O2_RE = /(^|[_\-.])o2(?=[_\-.]|$)/i;

const bad = [];

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (FILENAME_O2_RE.test(ent.name)) bad.push(`directory name: ${path.relative(libraryRoot, p)}`);
      walk(p);
      continue;
    }
    const rel = path.relative(libraryRoot, p);
    if (FILENAME_O2_RE.test(ent.name)) bad.push(`filename: ${rel}`);
    const ext = path.extname(ent.name);
    if (!TEXT_EXT.has(ext.toLowerCase())) continue;
    const text = fs.readFileSync(p, "utf8");
    if (CONTENT_RE.test(text)) bad.push(`content: ${rel}`);
  }
}

walk(libraryRoot);

if (bad.length) {
  console.error("Upstream residue in library/ (zinclabs, _o2_, or the upstream product name):\n" + bad.join("\n"));
  process.exit(1);
}
console.log("OK: no upstream residue under library/");
