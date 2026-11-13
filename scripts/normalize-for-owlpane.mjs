#!/usr/bin/env node
/**
 * Normalize community dashboard JSON, markdown, and filenames for Owlpane (Apache-2.0 source).
 * Titles, labels, documentation copy, filenames, chart colors, sample stream names, and `_o2_` stream fields.
 * Copyright lines are kept as upstream wrote them.
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

/** Owlpane console brand (--brand in console/src/index.css) */
const OWL_BRAND = "#0f7a4f";
const O2_PURPLES = ["#5960b2", "#5960B2", "#5b63b8", "#6366f1"];

const filenameRewrites = [];

/** A line that states a copyright notice is not a brand string. Leave it intact. */
export function isCopyrightLine(line) {
  return /\bcopyright\b/i.test(line);
}

function replaceVendorLine(s) {
  let out = s
    .replace(/https?:\/\/github\.com\/openobserve\/openobserve-helm-chart[^\s)]*/gi, "https://github.com/OwlPane/owlpane-agent")
    .replace(/https?:\/\/github\.com\/openobserve\/[^\s)]*/gi, "https://github.com/OwlPane/owlpane-dashboards")
    .replace(/https?:\/\/openobserve\.ai[^\s)]*/gi, "https://owlpane.ai/docs")
    .replace(/openobserve\.ai/gi, "owlpane.ai")
    .replace(/openobserve-collector/gi, "owlpane-otel-collector")
    .replace(/ZO_USAGE_REPORTING_ENABLED/g, "OWLPANE_USAGE_REPORTING_ENABLED")
    .replace(/\bOpenObserve\b/gi, "Owlpane")
    .replace(/\bopenobserve\b/gi, "owlpane")
    .replace(/\bZincObserve\b/gi, "Owlpane")
    .replace(/\bzincobserve\b/gi, "owlpane")
    .replace(/\broute53_zinclabs_dev\b/gi, "route53")
    .replace(/zinclabs\.dev/gi, "example.com")
    .replace(/\bzinclabs\b/gi, "example")
    .replace(/zinc\s+labs/gi, "example")
    .replace(/grafana-dashboards\//gi, "dashboards/")
    .replace(/\bGrafana\b/gi, "Prometheus");
  for (const c of O2_PURPLES) out = out.split(c).join(OWL_BRAND);
  return out;
}

export function replaceVendorText(s) {
  if (typeof s !== "string") return s;
  return s
    .split("\n")
    .map((line) => (isCopyrightLine(line) ? line : replaceVendorLine(line)))
    .join("\n");
}

function applyFilenameRewrites(s) {
  if (typeof s !== "string" || filenameRewrites.length === 0) return s;
  let out = s;
  for (const [from, to] of filenameRewrites) {
    if (from !== to) out = out.split(from).join(to);
  }
  return out;
}

/**
 * Drop an `o2` path segment from a filename (`cloudtrail_o2_dashboard.GIF` → `cloudtrail_dashboard.GIF`).
 * Leaves names that merely contain those letters inside another token.
 */
export function stripO2Filename(name) {
  const ext = path.extname(name);
  const base = ext ? name.slice(0, -ext.length) : name;
  if (!/(^|[_\-.])o2(?=[_\-.]|$)/i.test(base)) return name;
  let next = base
    .replace(/(^|[_\-.])o2(?=[_\-.]|$)/gi, "$1")
    .replace(/[_\-.]{2,}/g, (m) => m[0])
    .replace(/^[_\-.]+|[_\-.]+$/g, "");
  if (!next) next = "dashboard";
  return next + ext;
}

/** Point a stale `_o2_*` or sample-tenant stream at the table the query actually reads. */
export function replacementStream(stream, query) {
  if (typeof stream !== "string") return stream;
  if (/zinclabs/i.test(stream)) return "route53";
  if (stream.startsWith("_o2_")) {
    const match =
      typeof query === "string"
        ? query.match(/\bfrom\s+(?:logs\.)?["']?([A-Za-z_][A-Za-z0-9_]*)["']?/i)
        : null;
    if (match) return match[1];
    return stream.slice(4) || "logs";
  }
  return stream;
}

export function scrubO2Streams(node) {
  if (Array.isArray(node)) {
    for (const item of node) scrubO2Streams(item);
    return node;
  }
  if (!node || typeof node !== "object") return node;
  if (
    node.fields &&
    typeof node.fields === "object" &&
    typeof node.fields.stream === "string" &&
    (node.fields.stream.startsWith("_o2_") || /zinclabs/i.test(node.fields.stream))
  ) {
    node.fields.stream = replacementStream(node.fields.stream, node.query);
  }
  for (const value of Object.values(node)) scrubO2Streams(value);
  return node;
}

const walk = (v) => {
  if (Array.isArray(v)) return v.map(walk);
  if (v && typeof v === "object") {
    const o = {};
    for (const [k, val] of Object.entries(v)) o[k] = walk(val);
    return o;
  }
  return applyFilenameRewrites(replaceVendorText(v));
};

function main() {
  const root = path.resolve(process.argv[2] ?? path.join(import.meta.dirname, "..", "library"));
  if (!fs.existsSync(root)) {
    console.error("library path missing:", root);
    process.exit(1);
  }

  // Remove any upstream CI workflows inside library/
  fs.rmSync(path.join(root, ".github"), { recursive: true, force: true });

  filenameRewrites.length = 0;

  // Pass 1: Rename top-level directories if needed
  for (const e of fs.readdirSync(root, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    let nextName = e.name;
    if (/^openobserve$/i.test(nextName)) nextName = "Owlpane";
    else if (/openobserve-collector/i.test(nextName)) {
      nextName = nextName.replace(/openobserve-collector/gi, "owlpane-otel-collector");
    } else if (/openobserve/i.test(nextName)) {
      nextName = nextName.replace(/openobserve/gi, "Owlpane");
    }
    if (nextName !== e.name) {
      const src = path.join(root, e.name);
      const dst = path.join(root, nextName);
      fs.renameSync(src, dst);
    }
  }

  let jsonFiles = 0;
  let textFiles = 0;
  let renamedFiles = 0;

  (function renamePass(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) {
        renamePass(p);
        continue;
      }
      const parentName = path.basename(dir);
      let targetName = e.name;
      if (parentName === "Owlpane" && /^OpenObserve\s+/i.test(targetName)) {
        targetName = targetName.replace(/^OpenObserve\s+/i, "Owlpane Platform ");
      } else if (/openobserve/i.test(targetName)) {
        targetName = targetName.replace(/openobserve/gi, "Owlpane");
      }
      targetName = stripO2Filename(targetName);
      if (targetName !== e.name) {
        const nextPath = path.join(dir, targetName);
        fs.renameSync(p, nextPath);
        filenameRewrites.push([e.name, targetName]);
        renamedFiles++;
      }
    }
  })(root);

  (function scan(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) {
        scan(p);
        continue;
      }
      const parentName = path.basename(dir);
      const targetName = e.name;

      if (targetName.endsWith(".json")) {
        const raw = fs.readFileSync(p, "utf8");
        let json;
        try {
          json = JSON.parse(raw);
        } catch {
          continue;
        }
        const normalized = scrubO2Streams(walk(json));
        if (
          parentName === "Owlpane" &&
          normalized &&
          typeof normalized === "object" &&
          typeof normalized.title === "string" &&
          /^Owlpane\s+(Infrastructure|Internals)$/i.test(normalized.title)
        ) {
          normalized.title = normalized.title.replace(/^Owlpane\s+/i, "Owlpane Platform ");
        }
        fs.writeFileSync(p, `${JSON.stringify(normalized, null, 2)}\n`);
        jsonFiles++;
      } else if (/\.(md|yaml|yml)$/i.test(targetName)) {
        const raw = fs.readFileSync(p, "utf8");
        let next = applyFilenameRewrites(replaceVendorText(raw));
        if (parentName === "Owlpane" && /\.md$/i.test(targetName)) {
          next = next
            .replace(/# Owlpane Infrastructure/g, "# Owlpane Platform Infrastructure")
            .replace(/# Owlpane Internals/g, "# Owlpane Platform Internals");
        }
        if (next !== raw) {
          fs.writeFileSync(p, next);
        }
        textFiles++;
      }
    }
  })(root);

  console.log(
    `Normalized ${jsonFiles} JSON files, ${textFiles} doc/manifest files (${renamedFiles} renamed) under ${root}`,
  );
}

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isDirectRun) main();
