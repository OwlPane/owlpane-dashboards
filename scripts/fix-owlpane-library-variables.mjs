#!/usr/bin/env node
/**
 * Rename OpenObserve-style dashboard variable names to Owlpane-importable identifiers.
 * Preserves original JSON formatting (no full-file JSON.stringify).
 */
import fs from "node:fs";
import path from "node:path";

const dryRun = process.argv.includes("--dry-run");
const libraryRoot = path.join(import.meta.dirname, "../library");

const VAR_RENAME = new Map([
  ["k8s_cluster_name", "k8s_cluster"],
  ["k8s.cluster.name", "k8s_cluster"],
  ["k8s.namespace.name", "k8s_namespace"],
  ["k8s.node.name", "k8s_node"],
  ["k8s.pod.name", "k8s_pod"],
  ["k8s_namespace_name", "k8s_namespace"],
  ["k8s_node_name", "k8s_node"],
  ["k8s_pod_name", "k8s_pod"],
]);

/** Legacy $tokens in PromQL that do not match variables.list[].name after renames. */
const DOLLAR_ALIASES = new Map([
  ["k8s_cluster_name", "k8s_cluster"],
  ["k8s_cluster_name_name", "k8s_cluster"],
  ["k8s_namespace_name", "k8s_namespace"],
  ["k8s_node_name", "k8s_node"],
  ["k8s_pod_name", "k8s_pod"],
  ["k8s.namespace.name", "k8s_namespace"],
  ["k8s.node.name", "k8s_node"],
  ["k8s.pod.name", "k8s_pod"],
]);

function walkJsonFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walkJsonFiles(p, out);
    else if (ent.name.endsWith(".dashboard.json") || ent.name.endsWith(".json")) out.push(p);
  }
  return out;
}

function rewriteDollarRefs(text, renames) {
  const all = new Map([...DOLLAR_ALIASES, ...renames]);
  let out = text;
  for (const [from, to] of all) {
    const esc = from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    out = out.replace(new RegExp(`\\$${esc}\\b`, "g"), `$${to}`);
    out = out.replace(new RegExp(`\\$\\{${esc}\\}`, "g"), `\${${to}}`);
  }
  return out;
}

/** Rename variables.list[].name in parsed doc; returns Map of renames applied. */
function renameVariableDefinitions(doc) {
  const renames = new Map();
  const list = doc?.variables?.list;
  if (!Array.isArray(list)) return renames;
  for (const v of list) {
    if (typeof v?.name !== "string") continue;
    const to = VAR_RENAME.get(v.name);
    if (to) renames.set(v.name, to);
  }
  return renames;
}

function patchVariableNamesInText(text, renames) {
  let out = text;
  for (const [from, to] of renames) {
    const esc = from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // Variable definitions only (not query_data.filter label keys).
    out = out.replace(
      new RegExp(`("type":\\s*"query_values",\\s*"name":\\s*")${esc}(")`, "g"),
      `$1${to}$2`,
    );
    out = out.replace(
      new RegExp(`("type":\\s*"query_values",\\s*\\n\\s*"name":\\s*")${esc}(")`, "g"),
      `$1${to}$2`,
    );
  }
  return out;
}

function fixFile(filePath) {
  const before = fs.readFileSync(filePath, "utf8");
  let doc;
  try {
    doc = JSON.parse(before);
  } catch {
    console.warn("skip invalid JSON", filePath);
    return false;
  }
  const renames = renameVariableDefinitions(doc);
  let after = renames.size ? patchVariableNamesInText(before, renames) : before;
  after = rewriteDollarRefs(after, renames);
  if (after === before) return false;
  if (!dryRun) fs.writeFileSync(filePath, after);
  return true;
}

const files = walkJsonFiles(libraryRoot);
let changed = 0;
for (const f of files) {
  if (fixFile(f)) {
    changed++;
    console.log(dryRun ? "would update" : "updated", path.relative(libraryRoot, f));
  }
}
console.log(`${dryRun ? "dry-run: " : ""}${changed} of ${files.length} dashboard JSON files updated`);
